"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { MARKET_SYMBOLS } from "./symbols"
import {
  fetchExchangeStats,
  fetchFundingHistory,
  fetchKlines,
  fetchMarkPrice,
  fetchOpenInterest,
  fetchOrderBook,
  fetchTicker,
  fetchTickers,
  fetchTrades,
  snapDepthLimit,
  type ExchangeStats,
} from "./rest"
import { activeMarket, subscribeMarket, warmMarket, type MarketKind } from "./endpoints"
import { isDocumentVisible, openStream, readDepth, type StreamStatus } from "./stream"
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

function num(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function aborted(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}

/* -------------------------------------------------------------------------- */
/* Market feed                                                                */
/* -------------------------------------------------------------------------- */

export interface MarketFeed {
  kind: MarketKind
  /** True when the feed carries mark price, funding rate and open interest. */
  derivatives: boolean
  /** Human label, e.g. "USD-M futures" or "spot". */
  label: string
}

/**
 * Which Binance surface is serving data right now. Views read this to render
 * derivatives-only fields honestly instead of leaving them loading forever.
 *
 * Mounting also starts feed detection without awaiting it, so a network that
 * blocks the futures host resolves in the background while the app renders on
 * whatever data has already arrived.
 */
export function useMarketProfile(): MarketFeed {
  const kind = useSyncExternalStore(
    subscribeMarket,
    () => activeMarket().kind,
    () => "futures" as MarketKind,
  )

  useEffect(() => {
    warmMarket()
  }, [])

  return {
    kind,
    derivatives: kind === "futures",
    label: activeMarket().label,
  }
}

/* -------------------------------------------------------------------------- */
/* REST polling                                                               */
/* -------------------------------------------------------------------------- */

interface PollState<T> {
  data: T | null
  loading: boolean
  error: string
  updatedAt: number
}

/**
 * Polls a loader while the tab is visible. The loader is held in a ref so callers
 * can pass an inline closure without restarting the interval every render.
 */
function usePoll<T>(key: string, load: (signal: AbortSignal) => Promise<T>, intervalMs: number) {
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  const [state, setState] = useState<PollState<T>>({
    data: null,
    loading: true,
    error: "",
    updatedAt: 0,
  })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const run = async () => {
      try {
        const data = await loadRef.current(controller.signal)
        if (cancelled) return
        setState({ data, loading: false, error: "", updatedAt: Date.now() })
      } catch (error) {
        if (cancelled || aborted(error)) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Market feed error.",
        }))
      }
    }

    run()

    const timer =
      intervalMs > 0
        ? setInterval(() => {
            if (isDocumentVisible()) run()
          }, intervalMs)
        : null

    const onVisibility = () => {
      if (isDocumentVisible()) run()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelled = true
      controller.abort()
      if (timer) clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [key, intervalMs, nonce])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, refresh }
}

/* -------------------------------------------------------------------------- */
/* Live tickers                                                               */
/* -------------------------------------------------------------------------- */

export interface LiveTickers {
  tickers: Ticker24h[]
  byBase: Map<string, Ticker24h>
  loading: boolean
  error: string
  status: StreamStatus
  updatedAt: number
  refresh: () => void
}

/**
 * The whole COINX universe: a REST snapshot every 15s, patched in real time by
 * per-symbol `@ticker` streams (lighter than subscribing to `!ticker@arr`).
 */
export function useLiveTickers(intervalMs = 15000): LiveTickers {
  const poll = usePoll("tickers", (signal) => fetchTickers(signal), intervalMs)
  const [patch, setPatch] = useState<Map<string, Partial<Ticker24h>>>(() => new Map())
  const [status, setStatus] = useState<StreamStatus>("connecting")

  useEffect(() => {
    const handle = openStream({
      streams: MARKET_SYMBOLS.map((m) => `${m.symbol.toLowerCase()}@ticker`),
      onStatus: setStatus,
      onMessage: ({ data }) => {
        const row = data as Record<string, unknown>
        const symbol = String(row.s)
        if (!symbol) return
        setPatch((prev) => {
          const next = new Map(prev)
          next.set(symbol, {
            price: num(row.c),
            priceChange: num(row.p),
            changePct: num(row.P),
            high: num(row.h),
            low: num(row.l),
            volume: num(row.v),
            quoteVolume: num(row.q),
            updatedAt: Date.now(),
          })
          return next
        })
      },
    })
    return () => handle.close()
  }, [])

  const tickers = useMemo(() => {
    const seed = poll.data ?? []
    const merged = seed.map((ticker) => {
      const live = patch.get(ticker.symbol)
      return live ? { ...ticker, ...live } : ticker
    })
    // Before the snapshot lands, fall back to whatever the streams already know.
    if (merged.length === 0 && patch.size > 0) {
      return MARKET_SYMBOLS.flatMap((meta) => {
        const live = patch.get(meta.symbol)
        if (!live) return []
        return [{ ...EMPTY_TICKER(meta.base, meta.symbol, meta.name, meta.pair), ...live }]
      })
    }
    return merged
  }, [poll.data, patch])

  const byBase = useMemo(() => new Map(tickers.map((t) => [t.base, t])), [tickers])

  return {
    tickers,
    byBase,
    loading: poll.loading && tickers.length === 0,
    error: tickers.length === 0 ? poll.error : "",
    status,
    updatedAt: poll.updatedAt,
    refresh: poll.refresh,
  }
}

function EMPTY_TICKER(base: string, symbol: string, name: string, pair: string): Ticker24h {
  return {
    base,
    symbol,
    name,
    pair,
    price: 0,
    priceChange: 0,
    changePct: 0,
    high: 0,
    low: 0,
    volume: 0,
    quoteVolume: 0,
    trades: 0,
    vwap: 0,
    updatedAt: 0,
  }
}

/**
 * One contract, one stream. Cheaper than pulling the whole universe when a view
 * only needs a single price (the header chip, a competition card header).
 */
export function useLiveTicker(base: string) {
  const poll = usePoll<Ticker24h | null>(
    `ticker:${base}`,
    (signal) => fetchTicker(base, signal),
    15000,
  )
  const [live, setLive] = useState<Partial<Ticker24h> | null>(null)

  useEffect(() => {
    const handle = openStream({
      streams: [`${base.toLowerCase()}usdt@ticker`],
      onStatus: () => undefined,
      onMessage: ({ data }) => {
        const row = data as Record<string, unknown>
        setLive({
          price: num(row.c),
          priceChange: num(row.p),
          changePct: num(row.P),
          high: num(row.h),
          low: num(row.l),
          volume: num(row.v),
          quoteVolume: num(row.q),
          updatedAt: Date.now(),
        })
      },
    })
    return () => handle.close()
  }, [base])

  const ticker = useMemo(() => {
    if (!poll.data) return null
    return live ? { ...poll.data, ...live } : poll.data
  }, [poll.data, live])

  return {
    ticker,
    loading: poll.loading && !ticker,
    error: ticker ? "" : poll.error,
    refresh: poll.refresh,
  }
}

/** Hourly closes for the last 24 hours, one request per symbol. */
export function useSparklines(bases: string[], intervalMs = 60000) {
  const key = bases.join(",")
  const poll = usePoll(
    `sparklines:${key}`,
    async (signal) => {
      const results = await Promise.allSettled(
        bases.map(async (base) => {
          const candles = await fetchKlines(base, "1h", 24, signal)
          return [base, candles.map((c) => c.c)] as const
        }),
      )
      const map: Record<string, number[]> = {}
      for (const result of results) {
        if (result.status === "fulfilled") {
          const [base, closes] = result.value
          map[base] = closes
        }
      }
      return map
    },
    intervalMs,
  )

  return { sparklines: poll.data ?? {}, loading: poll.loading, error: poll.error }
}

/* -------------------------------------------------------------------------- */
/* Exchange aggregates                                                        */
/* -------------------------------------------------------------------------- */

export function useExchangeStats(intervalMs = 45000) {
  const poll = usePoll<ExchangeStats>(
    "exchange-stats",
    (signal) => fetchExchangeStats(signal),
    intervalMs,
  )
  return { stats: poll.data, loading: poll.loading, error: poll.error, refresh: poll.refresh }
}

/* -------------------------------------------------------------------------- */
/* Per-market hooks                                                           */
/* -------------------------------------------------------------------------- */

export function useKlines(base: string, interval: string, limit = 200) {
  const poll = usePoll<Candle[]>(
    `klines:${base}:${interval}:${limit}`,
    (signal) => fetchKlines(base, interval, limit, signal),
    // Closed candles never change, so a slow poll is enough; the live candle
    // arrives over the stream when a workspace is open.
    30000,
  )

  const [candles, setCandles] = useState<Candle[]>([])
  useEffect(() => {
    if (poll.data) setCandles(poll.data)
  }, [poll.data])

  useEffect(() => {
    const handle = openStream({
      streams: [`${base.toLowerCase()}usdt@kline_${interval}`],
      onStatus: () => undefined,
      onMessage: ({ data }) => {
        const k = (data as { k?: Record<string, unknown> }).k
        if (!k) return
        const candle: Candle = {
          t: num(k.t),
          o: num(k.o),
          h: num(k.h),
          l: num(k.l),
          c: num(k.c),
          v: num(k.v),
          closeTime: num(k.T),
          quoteVolume: num(k.q),
          trades: num(k.n),
          open: k.x === false,
        }
        setCandles((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.t === candle.t) return [...prev.slice(0, -1), candle]
          return [...prev, candle].slice(-limit)
        })
      },
    })
    return () => handle.close()
  }, [base, interval, limit])

  return { candles, loading: poll.loading && candles.length === 0, error: poll.error, refresh: poll.refresh }
}

export function useOrderBook(base: string, limit = 20, intervalMs = 3000) {
  const poll = usePoll<OrderBook>(
    `book:${base}:${limit}`,
    (signal) => fetchOrderBook(base, limit, signal),
    intervalMs,
  )
  const [book, setBook] = useState<OrderBook | null>(null)
  useEffect(() => {
    if (poll.data) setBook(poll.data)
  }, [poll.data])

  useEffect(() => {
    const handle = openStream({
      streams: [`${base.toLowerCase()}usdt@depth${snapDepthLimit(limit)}@100ms`],
      onStatus: () => undefined,
      onMessage: ({ data }) => {
        const { bids, asks } = readDepth(data)
        setBook((prev) => patchBook(prev, bids, asks, limit))
      },
    })
    return () => handle.close()
  }, [base, limit])

  return { book, loading: poll.loading && book === null, error: poll.error, refresh: poll.refresh }
}

function toLevels(rows: unknown, limit: number, descending: boolean): DepthLevel[] {
  if (!Array.isArray(rows)) return []
  let total = 0
  const levels = rows.slice(0, limit).map((row) => {
    const values = Array.isArray(row) ? row : []
    const price = num(values[0])
    const qty = num(values[1])
    total += qty
    return { price, qty, total }
  })
  return levels.sort((a, b) => (descending ? b.price - a.price : a.price - b.price))
}

export function patchBook(
  prev: OrderBook | null,
  rawBids: unknown,
  rawAsks: unknown,
  limit: number,
): OrderBook {
  const bids = toLevels(rawBids, limit, true)
  const asks = toLevels(rawAsks, limit, false)
  const bestBid = bids[0]?.price ?? 0
  const bestAsk = asks[0]?.price ?? 0
  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0
  const mid = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : (prev?.mid ?? 0)
  return {
    bids,
    asks,
    spread,
    spreadPct: mid ? (spread / mid) * 100 : 0,
    mid,
    bidNotional: bids.reduce((sum, l) => sum + l.price * l.qty, 0),
    askNotional: asks.reduce((sum, l) => sum + l.price * l.qty, 0),
  }
}

export function useTradeTape(base: string, limit = 24) {
  const poll = usePoll<MarketTrade[]>(
    `trades:${base}:${limit}`,
    (signal) => fetchTrades(base, limit, signal),
    4000,
  )
  const [trades, setTrades] = useState<MarketTrade[]>([])
  useEffect(() => {
    if (poll.data) setTrades(poll.data)
  }, [poll.data])

  useEffect(() => {
    const handle = openStream({
      streams: [`${base.toLowerCase()}usdt@aggTrade`],
      onStatus: () => undefined,
      onMessage: ({ data }) => {
        const row = data as Record<string, unknown>
        const price = num(row.p)
        const qty = num(row.q)
        if (!price) return
        setTrades((prev) =>
          [
            {
              id: num(row.a, Date.now()),
              price,
              qty,
              time: num(row.T, Date.now()),
              side: (row.m ? "sell" : "buy") as "buy" | "sell",
              notional: price * qty,
            },
            ...prev,
          ].slice(0, limit),
        )
      },
    })
    return () => handle.close()
  }, [base, limit])

  return { trades, loading: poll.loading && trades.length === 0, error: poll.error }
}

export function useMarkPrice(base: string) {
  const poll = usePoll<MarkPrice | null>(
    `mark:${base}`,
    (signal) => fetchMarkPrice(base, signal),
    20000,
  )
  const [mark, setMark] = useState<MarkPrice | null>(null)
  useEffect(() => {
    if (poll.data) setMark(poll.data)
  }, [poll.data])

  useEffect(() => {
    const handle = openStream({
      streams: [`${base.toLowerCase()}usdt@markPrice@1s`],
      onStatus: () => undefined,
      onMessage: ({ data }) => {
        const row = data as Record<string, unknown>
        setMark({
          symbol: String(row.s ?? `${base.toUpperCase()}USDT`),
          markPrice: num(row.p),
          indexPrice: num(row.i),
          fundingRatePct: num(row.r) * 100,
          nextFundingTime: num(row.T),
          updatedAt: Date.now(),
        })
      },
    })
    return () => handle.close()
  }, [base])

  return { mark, loading: poll.loading && mark === null, error: poll.error }
}

export function useFundingHistory(base: string, limit = 12) {
  const poll = usePoll<FundingPoint[]>(
    `funding:${base}:${limit}`,
    (signal) => fetchFundingHistory(base, limit, signal),
    120000,
  )
  return { funding: poll.data ?? [], loading: poll.loading, error: poll.error }
}

export function useOpenInterest(base: string, intervalMs = 30000) {
  const poll = usePoll<OpenInterest | null>(
    `oi:${base}`,
    (signal) => fetchOpenInterest(base, signal),
    intervalMs,
  )
  return { openInterest: poll.data, loading: poll.loading, error: poll.error }
}

/* -------------------------------------------------------------------------- */
/* Workspace: one socket, every stream, one render per frame                   */
/* -------------------------------------------------------------------------- */

export interface MarketWorkspace {
  ticker: Ticker24h | null
  candles: Candle[]
  book: OrderBook | null
  trades: MarketTrade[]
  mark: MarkPrice | null
  fundingHistory: FundingPoint[]
  openInterest: OpenInterest | null
  loading: boolean
  error: string
  status: StreamStatus
  updatedAt: number
  refresh: () => void
}

type WorkspaceState = Omit<MarketWorkspace, "refresh" | "loading">

const EMPTY_WORKSPACE: WorkspaceState = {
  ticker: null,
  candles: [],
  book: null,
  trades: [],
  mark: null,
  fundingHistory: [],
  openInterest: null,
  error: "",
  status: "connecting",
  updatedAt: 0,
}

/**
 * The full order-entry workspace for one contract: candles, book, tape, mark
 * price and settled funding. Depth at 100ms plus aggregate trades would otherwise
 * re-render the tree dozens of times a second, so incoming frames are buffered in
 * a ref and flushed once per animation frame.
 */
export function useMarketWorkspace(
  base: string,
  interval: string,
  opts: { bookLimit?: number; tradeLimit?: number; candleLimit?: number } = {},
): MarketWorkspace {
  const bookLimit = opts.bookLimit ?? 20
  const tradeLimit = opts.tradeLimit ?? 26
  const candleLimit = opts.candleLimit ?? 200

  const [state, setState] = useState<WorkspaceState>(EMPTY_WORKSPACE)
  const pending = useRef<WorkspaceState | null>(null)
  const latest = useRef<WorkspaceState>(EMPTY_WORKSPACE)
  const frame = useRef<number | null>(null)

  const scheduleFlush = useCallback(() => {
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const next = pending.current
      pending.current = null
      if (next) {
        latest.current = next
        setState(next)
      }
    })
  }, [])

  const patch = useCallback(
    (updater: (prev: WorkspaceState) => WorkspaceState) => {
      // The buffered value runs ahead of `state`, so chain off it when present.
      const next = updater(pending.current ?? latest.current)
      pending.current = next
      scheduleFlush()
    },
    [scheduleFlush],
  )

  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  /* REST seed + slow polling ------------------------------------------------- */
  const seed = usePoll(
    `workspace:${base}:${interval}:${bookLimit}:${tradeLimit}:${candleLimit}`,
    async (signal) => {
      const [ticker, candles, book, trades, mark, fundingHistory, openInterest] =
        await Promise.all([
          fetchTicker(base, signal),
          fetchKlines(base, interval, candleLimit, signal),
          fetchOrderBook(base, bookLimit, signal),
          fetchTrades(base, tradeLimit, signal),
          fetchMarkPrice(base, signal),
          fetchFundingHistory(base, 12, signal),
          fetchOpenInterest(base, signal),
        ])
      return { ticker, candles, book, trades, mark, fundingHistory, openInterest }
    },
    30000,
  )

  const seedData = seed.data
  useEffect(() => {
    if (!seedData) return
    const next: WorkspaceState = {
      ...EMPTY_WORKSPACE,
      ...seedData,
      error: "",
      status: latest.current.status,
      updatedAt: Date.now(),
    }
    latest.current = next
    pending.current = null
    setState(next)
  }, [seedData])

  const seedError = seed.error
  useEffect(() => {
    if (seedError) setState((prev) => ({ ...prev, error: seedError }))
  }, [seedError])

  /* Live streams ------------------------------------------------------------- */
  const symbol = `${base.toLowerCase()}usdt`

  useEffect(() => {
    const handle = openStream({
      streams: [
        `${symbol}@ticker`,
        `${symbol}@depth${snapDepthLimit(bookLimit)}@100ms`,
        `${symbol}@aggTrade`,
        `${symbol}@markPrice@1s`,
        `${symbol}@kline_${interval}`,
      ],
      onStatus: (status) => patch((prev) => ({ ...prev, status })),
      onMessage: ({ stream, data }) => {
        if (stream.endsWith("@ticker")) {
          const row = data as Record<string, unknown>
          patch((prev) =>
            prev.ticker
              ? {
                  ...prev,
                  updatedAt: Date.now(),
                  ticker: {
                    ...prev.ticker,
                    price: num(row.c),
                    priceChange: num(row.p),
                    changePct: num(row.P),
                    high: num(row.h),
                    low: num(row.l),
                    volume: num(row.v),
                    quoteVolume: num(row.q),
                    updatedAt: Date.now(),
                  },
                }
              : prev,
          )
          return
        }

        if (stream.includes("@depth")) {
          const { bids, asks } = readDepth(data)
          patch((prev) => ({
            ...prev,
            book: patchBook(prev.book, bids, asks, bookLimit),
          }))
          return
        }

        if (stream.endsWith("@aggTrade")) {
          const row = data as Record<string, unknown>
          const price = num(row.p)
          const qty = num(row.q)
          if (!price) return
          patch((prev) => ({
            ...prev,
            trades: [
              {
                id: num(row.a, Date.now()),
                price,
                qty,
                time: num(row.T, Date.now()),
                side: (row.m ? "sell" : "buy") as "buy" | "sell",
                notional: price * qty,
              },
              ...prev.trades,
            ].slice(0, tradeLimit),
          }))
          return
        }

        if (stream.includes("@markPrice")) {
          const row = data as Record<string, unknown>
          patch((prev) => ({
            ...prev,
            mark: {
              symbol: String(row.s ?? `${base.toUpperCase()}USDT`),
              markPrice: num(row.p),
              indexPrice: num(row.i),
              fundingRatePct: num(row.r) * 100,
              nextFundingTime: num(row.T),
              updatedAt: Date.now(),
            },
          }))
          return
        }

        if (stream.includes("@kline_")) {
          const k = (data as { k?: Record<string, unknown> }).k
          if (!k) return
          const candle: Candle = {
            t: num(k.t),
            o: num(k.o),
            h: num(k.h),
            l: num(k.l),
            c: num(k.c),
            v: num(k.v),
            closeTime: num(k.T),
            quoteVolume: num(k.q),
            trades: num(k.n),
            open: k.x === false,
          }
          patch((prev) => {
            const last = prev.candles[prev.candles.length - 1]
            const candles =
              last && last.t === candle.t
                ? [...prev.candles.slice(0, -1), candle]
                : [...prev.candles, candle].slice(-candleLimit)
            return { ...prev, candles }
          })
        }
      },
    })
    return () => handle.close()
  }, [symbol, interval, bookLimit, tradeLimit, candleLimit, base, patch])

  const { refresh: resync } = seed
  const refresh = useCallback(() => {
    pending.current = null
    resync()
  }, [resync])

  return {
    ...state,
    loading: !state.ticker,
    refresh,
  }
}
