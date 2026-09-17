"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import CandlestickChart from "@/components/common/CandlestickChart"
import { MARKETS } from "@/mocks/markets"

type StatTab = "overview" | "funding" | "mark" | "technicals"

type Candle = {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

type Ticker = {
  price: number
  change: number
  high: number
  low: number
  volume: number
  quoteVolume: number
}

type DepthRow = {
  price: number
  qty: number
  total: number
}

type TradeRow = {
  id: number
  price: number
  qty: number
  time: number
  side: "buy" | "sell"
}

type MarkData = {
  markPrice: number
  indexPrice: number
  fundingRate: number
  nextFundingTime: number
}

type FundingRow = {
  fundingTime: number
  fundingRate: number
}

type OpenInterest = {
  value: number
  time: number
}

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"]
const STAT_TABS: StatTab[] = ["overview", "funding", "mark", "technicals"]
const EMPTY_TICKER: Ticker = { price: 0, change: 0, high: 0, low: 0, volume: 0, quoteVolume: 0 }
const EMPTY_MARK: MarkData = { markPrice: 0, indexPrice: 0, fundingRate: 0, nextFundingTime: 0 }

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatPrice(value: number): string {
  if (!value) return "—"
  if (value < 1) return value.toFixed(5)
  if (value < 100) return value.toFixed(3)
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatCompact(value: number): string {
  if (!value) return "—"
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value)
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return `${value >= 0 ? "+" : ""}${value.toFixed(3)}%`
}

function formatTime(value: number): string {
  if (!value) return "—"
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function mapDepth(rows: unknown): DepthRow[] {
  if (!Array.isArray(rows)) return []

  let total = 0
  return rows.slice(0, 14).map((row) => {
    const values = Array.isArray(row) ? row : []
    const price = toNumber(values[0])
    const qty = toNumber(values[1])
    total += qty
    return { price, qty, total }
  })
}

function mapFunding(rows: unknown): FundingRow[] {
  if (!Array.isArray(rows)) return []

  return rows.slice(-8).reverse().map((row) => {
    const data = row as Record<string, unknown>
    return {
      fundingTime: toNumber(data.fundingTime),
      fundingRate: toNumber(data.fundingRate) * 100,
    }
  })
}

function calculateTechnicals(candles: Candle[], ticker: Ticker) {
  const closes = candles.map((c) => c.c).slice(-50)
  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    gains.push(Math.max(diff, 0))
    losses.push(Math.abs(Math.min(diff, 0)))
  }

  const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / 14
  const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / 14
  const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.max(closes.slice(-20).length, 1)
  const sma50 = closes.reduce((a, b) => a + b, 0) / Math.max(closes.length, 1)
  const bias = ticker.price && sma20 ? ((ticker.price - sma20) / sma20) * 100 : 0

  return [
    { label: "RSI 14", value: Number.isFinite(rsi) ? rsi.toFixed(1) : "—", hint: rsi > 70 ? "Hot" : rsi < 30 ? "Cold" : "Range" },
    { label: "SMA 20", value: formatPrice(sma20), hint: bias >= 0 ? "Above" : "Below" },
    { label: "SMA 50", value: formatPrice(sma50), hint: ticker.price >= sma50 ? "Above" : "Below" },
    { label: "24h Bias", value: formatPercent(ticker.change), hint: ticker.change >= 0 ? "Bid" : "Offer" },
  ]
}

export default function MarketDetailPage() {
  const router = useRouter()
  const { symbol } = useParams<{ symbol: string }>()
  const baseSymbol = symbol?.toUpperCase() ?? "BTC"
  const pairSymbol = `${baseSymbol}USDT`
  const market = MARKETS.find((m) => m.symbol === baseSymbol) ?? MARKETS[0]
  const [timeframe, setTimeframe] = useState("1h")
  const [statTab, setStatTab] = useState<StatTab>("overview")
  const [candles, setCandles] = useState<Candle[]>([])
  const [ticker, setTicker] = useState<Ticker>(EMPTY_TICKER)
  const [mark, setMark] = useState<MarkData>(EMPTY_MARK)
  const [funding, setFunding] = useState<FundingRow[]>([])
  const [openInterest, setOpenInterest] = useState<OpenInterest>({ value: 0, time: 0 })
  const [bids, setBids] = useState<DepthRow[]>([])
  const [asks, setAsks] = useState<DepthRow[]>([])
  const [trades, setTrades] = useState<TradeRow[]>([])
  const [error, setError] = useState("")

  const stats = useMemo(() => [
    { k: "Last Price", v: formatPrice(ticker.price) },
    { k: "24h Change", v: formatPercent(ticker.change) },
    { k: "24h High", v: formatPrice(ticker.high) },
    { k: "24h Low", v: formatPrice(ticker.low) },
    { k: "24h Volume", v: `$${formatCompact(ticker.quoteVolume)}` },
    { k: "Open Interest", v: `${formatCompact(openInterest.value)} ${baseSymbol}` },
  ], [baseSymbol, openInterest.value, ticker])

  const depthMax = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total), 1)
  const technicals = useMemo(() => calculateTechnicals(candles, ticker), [candles, ticker])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function loadInitialData() {
      try {
        setError("")
        const [klines, tickerData, depthData, tradesData, markData, fundingData, oiData] = await Promise.all([
          fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${pairSymbol}&interval=${timeframe}&limit=180`, { signal: controller.signal }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${pairSymbol}`, { signal: controller.signal }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/depth?symbol=${pairSymbol}&limit=20`, { signal: controller.signal }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/trades?symbol=${pairSymbol}&limit=18`, { signal: controller.signal }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${pairSymbol}`, { signal: controller.signal }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${pairSymbol}&limit=8`, { signal: controller.signal }).then((r) => r.json()),
          fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${pairSymbol}`, { signal: controller.signal }).then((r) => r.json()),
        ])

        if (!active) return

        if (Array.isArray(klines)) {
          setCandles(klines.map((k) => {
            const row = Array.isArray(k) ? k : []
            return { t: toNumber(row[0]), o: toNumber(row[1]), h: toNumber(row[2]), l: toNumber(row[3]), c: toNumber(row[4]), v: toNumber(row[5]) }
          }))
        }

        setTicker({
          price: toNumber(tickerData.lastPrice),
          change: toNumber(tickerData.priceChangePercent),
          high: toNumber(tickerData.highPrice),
          low: toNumber(tickerData.lowPrice),
          volume: toNumber(tickerData.volume),
          quoteVolume: toNumber(tickerData.quoteVolume),
        })
        setBids(mapDepth(depthData.bids))
        setAsks(mapDepth(depthData.asks))
        setTrades(Array.isArray(tradesData) ? tradesData.slice(-18).reverse().map((trade) => {
          const data = trade as Record<string, unknown>
          return { id: toNumber(data.id), price: toNumber(data.price), qty: toNumber(data.qty), time: toNumber(data.time), side: data.isBuyerMaker ? "sell" : "buy" }
        }) : [])
        setMark({
          markPrice: toNumber(markData.markPrice),
          indexPrice: toNumber(markData.indexPrice),
          fundingRate: toNumber(markData.lastFundingRate) * 100,
          nextFundingTime: toNumber(markData.nextFundingTime),
        })
        setFunding(mapFunding(fundingData))
        setOpenInterest({ value: toNumber(oiData.openInterest), time: toNumber(oiData.time) })
      } catch (err) {
        if (!controller.signal.aborted) setError("Binance market feed unavailable")
      }
    }

    loadInitialData()

    return () => {
      active = false
      controller.abort()
    }
  }, [pairSymbol, timeframe])

  useEffect(() => {
    const streamSymbol = pairSymbol.toLowerCase()
    const streams = [
      `${streamSymbol}@ticker`,
      `${streamSymbol}@depth20@100ms`,
      `${streamSymbol}@trade`,
      `${streamSymbol}@markPrice@1s`,
      `${streamSymbol}@kline_${timeframe}`,
    ].join("/")
    const socket = new WebSocket(`wss://fstream.binance.com/stream?streams=${streams}`)

        socket.onmessage = (event) => {
          const message = JSON.parse(event.data) as { stream?: string; data?: Record<string, unknown> }
          const data = message.data
          if (!data || !message.stream) return

          if (message.stream.endsWith("@ticker")) {
            setTicker({
              price: toNumber(data.c),
              change: toNumber(data.P),
              high: toNumber(data.h),
              low: toNumber(data.l),
              volume: toNumber(data.v),
              quoteVolume: toNumber(data.q),
            })
          }

          if (message.stream.includes("@depth20")) {
            setBids(mapDepth(data.b))
            setAsks(mapDepth(data.a))
          }

          if (message.stream.endsWith("@trade")) {
            setTrades((current) => [{ id: toNumber(data.t), price: toNumber(data.p), qty: toNumber(data.q), time: toNumber(data.T), side: (data.m ? "sell" : "buy") as "sell" | "buy" }, ...current].slice(0, 18))
          }

          if (message.stream.includes("@markPrice")) {
            setMark({ markPrice: toNumber(data.p), indexPrice: toNumber(data.i), fundingRate: toNumber(data.r) * 100, nextFundingTime: toNumber(data.T) })
          }

          if (message.stream.includes("@kline_")) {
            const k = data.k as Record<string, unknown> | undefined
            if (!k) return
            const candle = { t: toNumber(k.t), o: toNumber(k.o), h: toNumber(k.h), l: toNumber(k.l), c: toNumber(k.c), v: toNumber(k.v) }
            setCandles((current) => {
              const next = current.slice(-179)
              const last = next[next.length - 1]
              if (last?.t === candle.t) return [...next.slice(0, -1), candle]
              return [...next, candle]
            })
          }
        }


    socket.onerror = () => setError("Realtime stream disconnected")
    return () => socket.close()
  }, [pairSymbol, timeframe])

  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-4 md:px-6">
        <section className="grid grid-cols-1 gap-3 border-b border-zinc-800 pb-4 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">{baseSymbol}</h1>
              <span className="font-mono text-xs text-zinc-500">USDT PERP</span>
            </div>
            <div className="font-mono text-3xl font-medium tracking-tight md:text-4xl">{formatPrice(ticker.price || market.price)}</div>
            <div className={`font-mono text-sm ${ticker.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(ticker.change || market.change24h)} 24h</div>
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.k} className="bg-[#0b0e13] p-4">
                <div className="text-xs text-zinc-500">{s.k}</div>
                <div className="mt-2 font-mono text-sm text-zinc-100">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#0b0e13]">
              <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-zinc-300">{pairSymbol}</span>
                  <span className={`rounded-full px-2 py-1 font-mono text-xs ${ticker.change >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>{formatPercent(ticker.change)}</span>
                </div>
                <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-950 p-1">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-lg px-3 py-1.5 font-mono text-xs transition active:scale-[0.98] ${timeframe === tf ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:text-zinc-200"}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3">
                <CandlestickChart height={420} candles={candles} />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0b0e13]">
              <div className="flex overflow-x-auto border-b border-zinc-800 p-1">
                {STAT_TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setStatTab(t)}
                    className={`rounded-xl px-4 py-2 text-sm capitalize transition active:scale-[0.98] ${statTab === t ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:text-zinc-200"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {statTab === "overview" && (
                <div className="grid grid-cols-1 divide-y divide-zinc-800 md:grid-cols-2 md:divide-x md:divide-y-0">
                  <div className="p-5">
                    <div className="text-sm text-zinc-500">Open Interest</div>
                    <div className="mt-2 font-mono text-3xl">{formatCompact(openInterest.value)} {baseSymbol}</div>
                    <div className="mt-1 text-xs text-zinc-600">Updated {formatTime(openInterest.time)}</div>
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-zinc-500">Quote Volume</div>
                    <div className="mt-2 font-mono text-3xl">${formatCompact(ticker.quoteVolume)}</div>
                    <div className="mt-1 text-xs text-zinc-600">Realtime 24h ticker</div>
                  </div>
                </div>
              )}

              {statTab === "funding" && (
                <div className="divide-y divide-zinc-800">
                  {funding.map((row) => (
                    <div key={row.fundingTime} className="grid grid-cols-3 px-5 py-3 font-mono text-sm">
                      <span className="text-zinc-500">{formatTime(row.fundingTime)}</span>
                      <span className="text-right text-zinc-100">{row.fundingRate.toFixed(4)}%</span>
                      <span className={`text-right ${row.fundingRate >= 0 ? "text-emerald-400" : "text-red-400"}`}>{row.fundingRate >= 0 ? "Longs pay" : "Shorts pay"}</span>
                    </div>
                  ))}
                </div>
              )}

              {statTab === "mark" && (
                <div className="grid grid-cols-1 gap-px bg-zinc-800 md:grid-cols-3">
                  {[
                    ["Mark", formatPrice(mark.markPrice)],
                    ["Index", formatPrice(mark.indexPrice)],
                    ["Next Funding", formatTime(mark.nextFundingTime)],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#0b0e13] p-5">
                      <div className="text-sm text-zinc-500">{label}</div>
                      <div className="mt-2 font-mono text-xl">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {statTab === "technicals" && (
                <div className="grid grid-cols-1 gap-px bg-zinc-800 md:grid-cols-4">
                  {technicals.map((item) => (
                    <div key={item.label} className="bg-[#0b0e13] p-5">
                      <div className="text-sm text-zinc-500">{item.label}</div>
                      <div className="mt-2 font-mono text-xl">{item.value}</div>
                      <div className="mt-1 text-xs text-zinc-600">{item.hint}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#0b0e13]">
              <div className="border-b border-zinc-800 p-4 text-sm text-zinc-400">Order book</div>
              <div className="grid grid-cols-3 px-4 py-2 font-mono text-[11px] text-zinc-600">
                <span>Price</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-zinc-900">
                {asks.slice().reverse().map((row) => (
                  <div key={`ask-${row.price}`} className="relative grid grid-cols-3 px-4 py-1.5 font-mono text-xs">
                    <span className="relative z-10 text-red-300">{formatPrice(row.price)}</span>
                    <span className="relative z-10 text-right text-zinc-400">{row.qty.toFixed(3)}</span>
                    <span className="relative z-10 text-right text-zinc-500">{row.total.toFixed(3)}</span>
                    <span className="absolute inset-y-0 right-0 bg-red-500/10" style={{ width: `${(row.total / depthMax) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="border-y border-zinc-800 px-4 py-3 font-mono text-lg">{formatPrice(ticker.price)}</div>
              <div className="divide-y divide-zinc-900">
                {bids.map((row) => (
                  <div key={`bid-${row.price}`} className="relative grid grid-cols-3 px-4 py-1.5 font-mono text-xs">
                    <span className="relative z-10 text-emerald-300">{formatPrice(row.price)}</span>
                    <span className="relative z-10 text-right text-zinc-400">{row.qty.toFixed(3)}</span>
                    <span className="relative z-10 text-right text-zinc-500">{row.total.toFixed(3)}</span>
                    <span className="absolute inset-y-0 right-0 bg-emerald-500/10" style={{ width: `${(row.total / depthMax) * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0b0e13]">
              <div className="border-b border-zinc-800 p-4 text-sm text-zinc-400">Live tape</div>
              <div className="divide-y divide-zinc-900">
                {trades.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-3 px-4 py-2 font-mono text-xs">
                    <span className={trade.side === "buy" ? "text-emerald-300" : "text-red-300"}>{formatPrice(trade.price)}</span>
                    <span className="text-right text-zinc-400">{trade.qty.toFixed(4)}</span>
                    <span className="text-right text-zinc-600">{formatTime(trade.time)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0b0e13] p-4">
              <div className="text-sm text-zinc-400">Quick trade</div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition active:scale-[0.98]">Long</button>
                <button className="rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition active:scale-[0.98]">Short</button>
              </div>
              <button className="mt-3 w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition active:scale-[0.98]" onClick={() => router.push(ROUTES.liveComp(1))}>
                Trade {baseSymbol}
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
