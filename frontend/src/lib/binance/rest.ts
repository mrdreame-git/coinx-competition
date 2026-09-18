import { MARKET_SYMBOLS, findSymbol, type MarketSymbol } from "./symbols"
import { activeMarket, demoteToSpot, restUrl } from "./endpoints"
import type {
  Candle,
  DepthLevel,
  FundingPoint,
  MarkPrice,
  MarketTrade,
  OpenInterest,
  OrderBook,
  Ticker24h,
} from "./types"

/**
 * Every path here is relative to whichever market is active, so the same fetcher
 * serves both Binance surfaces:
 *
 *   futures  /fapi/v1/ticker/24hr
 *   spot     /api/v3/ticker/24hr
 *
 * Both return the same field names for these endpoints, which is why one set of
 * normalizers is enough.
 */

export class BinanceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = "BinanceError"
  }
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Binance only accepts a fixed set of depth levels on futures (5/10/20/50/100/
 * 500/1000) and rejects anything else with a 400, where spot silently accepts.
 * The UI asks for "about 14 levels", so snap to the nearest allowed value rather
 * than letting a futures request fail outright.
 */
const DEPTH_STEPS = [5, 10, 20, 50, 100, 500, 1000]

export function snapDepthLimit(limit: number): number {
  return DEPTH_STEPS.find((step) => step >= limit) ?? 1000
}

const SYMBOLS_QUERY = encodeURIComponent(
  `[${MARKET_SYMBOLS.map((meta) => `"${meta.symbol}"`).join(",")}]`,
)


function aborted(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

/**
 * Fetches a relative path from the active market.
 *
 * If the request fails at the network layer rather than with an HTTP status, the
 * host itself is unreachable. That is what an ISP-level block on `*.binance.com`
 * looks like, so the app demotes itself to Binance's spot feed and retries the
 * same path once. The demotion is remembered for the session, and every later
 * request goes straight to the working host.
 */
async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    const profile = activeMarket()
    let res: Response
    try {
      res = await fetch(restUrl(profile, path), { signal, cache: "no-store" })
    } catch (error) {
      if (aborted(error)) throw error
      // Network-level failure. Futures is worth one fallback; spot is the floor.
      if (profile.kind === "futures" && attempt === 0) {
        demoteToSpot()
        continue
      }
      throw new BinanceError(
        `Could not reach ${profile.restBase}. Check your connection, or set NEXT_PUBLIC_BINANCE_MARKET to pin a specific feed.`,
      )
    }

    if (!res.ok) {
      if (res.status === 451) {
        throw new BinanceError("Binance is not available from this region.", 451)
      }
      if (res.status === 429 || res.status === 418) {
        throw new BinanceError("Rate limited by Binance. Slowing down.", res.status)
      }
      throw new BinanceError(`Binance returned ${res.status}.`, res.status)
    }

    return (await res.json()) as T
  }
}

function normalizeTicker(raw: Record<string, unknown>, meta: MarketSymbol): Ticker24h {
  return {
    base: meta.base,
    symbol: meta.symbol,
    name: meta.name,
    pair: meta.pair,
    price: num(raw.lastPrice),
    priceChange: num(raw.priceChange),
    changePct: num(raw.priceChangePercent),
    high: num(raw.highPrice),
    low: num(raw.lowPrice),
    volume: num(raw.volume),
    quoteVolume: num(raw.quoteVolume),
    trades: num(raw.count),
    vwap: num(raw.weightedAvgPrice),
    updatedAt: num(raw.closeTime, Date.now()),
  }
}

/**
 * 24h rolling stats for the COINX universe in one round trip, from a single
 * filtered request.
 *
 * The `symbols` filter is honoured on spot (16 rows, ~2 KB) but silently ignored
 * on futures, which answers with every listed contract instead. Rather than pay
 * 16 round trips to work around that, the response is indexed by symbol and the
 * universe is picked out of it. That keeps the spot path tiny and leaves the
 * futures path no heavier than an unfiltered call, while the parsing stays
 * identical on both because the field names match.
 */
export async function fetchTickers(signal?: AbortSignal): Promise<Ticker24h[]> {
  const raw = await getJson<Record<string, unknown>[]>(
    `/ticker/24hr?symbols=${SYMBOLS_QUERY}`,
    signal,
  )
  const bySymbol = new Map(raw.map((row) => [String(row.symbol), row]))

  return MARKET_SYMBOLS.flatMap((meta) => {
    const row = bySymbol.get(meta.symbol)
    return row ? [normalizeTicker(row, meta)] : []
  })
}

export async function fetchTicker(symbol: string, signal?: AbortSignal): Promise<Ticker24h | null> {
  const meta = findSymbol(symbol)
  if (!meta) return null
  const raw = await getJson<Record<string, unknown>>(`/ticker/24hr?symbol=${meta.symbol}`, signal)
  return normalizeTicker(raw, meta)
}

export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 200,
  signal?: AbortSignal,
): Promise<Candle[]> {
  const meta = findSymbol(symbol)
  if (!meta) return []
  const raw = await getJson<unknown[][]>(
    `/klines?symbol=${meta.symbol}&interval=${interval}&limit=${limit}`,
    signal,
  )

  return raw.map((row) => ({
    t: num(row[0]),
    o: num(row[1]),
    h: num(row[2]),
    l: num(row[3]),
    c: num(row[4]),
    v: num(row[5]),
    closeTime: num(row[6]),
    quoteVolume: num(row[7]),
    trades: num(row[8]),
    open: num(row[6]) > Date.now(),
  }))
}

function mapLevels(rows: unknown, limit: number): DepthLevel[] {
  if (!Array.isArray(rows)) return []
  let total = 0
  return rows.slice(0, limit).map((row) => {
    const values = Array.isArray(row) ? row : []
    const price = num(values[0])
    const qty = num(values[1])
    total += qty
    return { price, qty, total }
  })
}

export async function fetchOrderBook(
  symbol: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<OrderBook> {
  const meta = findSymbol(symbol)
  if (!meta) throw new BinanceError("Unknown market.")

  const levels = snapDepthLimit(limit)
  // Futures exposes the book as {bids, asks}; spot's snapshot endpoint does too,
  // and both sort bids descending and asks ascending.
  const raw = await getJson<{ bids?: unknown; asks?: unknown }>(
    `/depth?symbol=${meta.symbol}&limit=${levels}`,
    signal,
  )

  const bids = mapLevels(raw.bids, limit).sort((a, b) => b.price - a.price)
  const asks = mapLevels(raw.asks, limit).sort((a, b) => a.price - b.price)
  const bestBid = bids[0]?.price ?? 0
  const bestAsk = asks[0]?.price ?? 0
  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0
  const mid = bestBid && bestAsk ? (bestAsk + bestBid) / 2 : 0

  return {
    bids,
    asks,
    spread,
    spreadPct: mid ? (spread / mid) * 100 : 0,
    mid,
    bidNotional: bids.reduce((sum, level) => sum + level.price * level.qty, 0),
    askNotional: asks.reduce((sum, level) => sum + level.price * level.qty, 0),
  }
}

export async function fetchTrades(
  symbol: string,
  limit = 24,
  signal?: AbortSignal,
): Promise<MarketTrade[]> {
  const meta = findSymbol(symbol)
  if (!meta) return []

  const raw = await getJson<Record<string, unknown>[]>(
    `/trades?symbol=${meta.symbol}&limit=${limit}`,
    signal,
  )

  return raw
    .map((row) => {
      const price = num(row.price)
      const qty = num(row.qty)
      return {
        id: num(row.id),
        price,
        qty,
        time: num(row.time),
        // isBuyerMaker true means the seller was the aggressor.
        side: (row.isBuyerMaker ? "sell" : "buy") as "buy" | "sell",
        notional: price * qty,
      }
    })
    .reverse()
}

/* -------------------------------------------------------------------------- */
/* Derivatives-only                                                           */
/* -------------------------------------------------------------------------- */
/*                                                                            */
/* Mark price, funding and open interest are futures concepts. On the spot     */
/* feed they return empty rather than hitting an endpoint that does not exist, */
/* and the UI renders the absence explicitly instead of an endless placeholder.*/
/* -------------------------------------------------------------------------- */

export async function fetchMarkPrice(symbol: string, signal?: AbortSignal): Promise<MarkPrice | null> {
  if (!activeMarket().derivatives) return null
  const meta = findSymbol(symbol)
  if (!meta) return null
  const raw = await getJson<Record<string, unknown>>(
    `/premiumIndex?symbol=${meta.symbol}`,
    signal,
  )
  return {
    symbol: meta.symbol,
    markPrice: num(raw.markPrice),
    indexPrice: num(raw.indexPrice),
    fundingRatePct: num(raw.lastFundingRate) * 100,
    nextFundingTime: num(raw.nextFundingTime),
    updatedAt: num(raw.time, Date.now()),
  }
}

export async function fetchFundingHistory(
  symbol: string,
  limit = 12,
  signal?: AbortSignal,
): Promise<FundingPoint[]> {
  if (!activeMarket().derivatives) return []
  const meta = findSymbol(symbol)
  if (!meta) return []
  const raw = await getJson<Record<string, unknown>[]>(
    `/fundingRate?symbol=${meta.symbol}&limit=${limit}`,
    signal,
  )
  return raw
    .map((row) => ({
      time: num(row.fundingTime),
      ratePct: num(row.fundingRate) * 100,
      markPrice: num(row.markPrice),
    }))
    .reverse()
}

export async function fetchOpenInterest(
  symbol: string,
  signal?: AbortSignal,
): Promise<OpenInterest | null> {
  if (!activeMarket().derivatives) return null
  const meta = findSymbol(symbol)
  if (!meta) return null
  const raw = await getJson<Record<string, unknown>>(`/openInterest?symbol=${meta.symbol}`, signal)
  return { value: num(raw.openInterest), time: num(raw.time, Date.now()) }
}

/* -------------------------------------------------------------------------- */
/* Aggregates                                                                 */
/* -------------------------------------------------------------------------- */

export interface ExchangeStats {
  /** 24h volume across the fetched universe, in USDT. */
  volume: number
  /** Open interest notional across the fetched universe, in USDT. */
  openInterest: number
  advancing: number
  declining: number
  /** True when open interest could not be read (spot feed). */
  openInterestUnavailable: boolean
}

/** Universe-wide aggregates used by the markets header and the dashboard. */
export async function fetchExchangeStats(signal?: AbortSignal): Promise<ExchangeStats> {
  const tickers = await fetchTickers(signal)
  const derivatives = activeMarket().derivatives

  let openInterest = 0
  if (derivatives) {
    // Zipped by index so each open-interest figure keeps its own symbol.
    const oi = await Promise.allSettled(
      MARKET_SYMBOLS.map((meta) => fetchOpenInterest(meta.symbol, signal)),
    )
    openInterest = oi.reduce((sum, result, index) => {
      if (result.status !== "fulfilled" || !result.value) return sum
      const ticker = tickers.find((t) => t.symbol === MARKET_SYMBOLS[index].symbol)
      if (!ticker) return sum
      return sum + result.value.value * ticker.price
    }, 0)
  }

  return {
    volume: tickers.reduce((sum, t) => sum + t.quoteVolume, 0),
    openInterest,
    advancing: tickers.filter((t) => t.changePct >= 0).length,
    declining: tickers.filter((t) => t.changePct < 0).length,
    openInterestUnavailable: !derivatives,
  }
}

/** Which Binance surface is serving data right now. */
export function currentMarketKind() {
  return activeMarket().kind
}
