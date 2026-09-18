'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ArrowsClockwise, ArrowRight, Info } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { findSymbol, MARKET_SYMBOLS } from '@/lib/binance/symbols'
import { useMarketProfile, useMarketWorkspace } from '@/lib/binance/hooks'
import type { Candle } from '@/lib/binance/types'
import {
  formatClock,
  formatNumber,
  formatPctPlain,
  formatPrice,
  formatQty,
  formatRelative,
  formatUsd,
} from '@/lib/format'
import Header from '@/components/layout/Header'
import CandlestickChart from '@/components/common/CandlestickChart'
import DepthChart from '@/components/common/DepthChart'
import ChangeTag from '@/components/common/ChangeTag'
import { ErrorState } from '@/components/common/StatePanel'

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
type Timeframe = (typeof TIMEFRAMES)[number]

const TABS = ['Overview', 'Funding', 'Technicals', 'Sessions'] as const
type Tab = (typeof TABS)[number]

/* ------------------------------------------------------------------ */
/* Indicators computed from the live candle series, never hardcoded.   */
/* ------------------------------------------------------------------ */

function rsi(candles: Candle[], period = 14): number | null {
  if (candles.length < period + 1) return null
  const closes = candles.map((candle) => candle.c)
  let gains = 0
  let losses = 0
  for (let index = closes.length - period; index < closes.length; index += 1) {
    const delta = closes[index] - closes[index - 1]
    if (delta >= 0) gains += delta
    else losses += Math.abs(delta)
  }
  if (losses === 0) return 100
  const relative = gains / period / (losses / period)
  return 100 - 100 / (1 + relative)
}

function average(candles: Candle[], period: number): number | null {
  if (candles.length < period) return null
  const window = candles.slice(-period)
  return window.reduce((sum, candle) => sum + candle.c, 0) / window.length
}

function StatCell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="label">{label}</p>
      <p className="num mt-1.5 text-[13px]" style={{ color: tone ?? 'var(--color-ink)' }}>
        {value}
      </p>
    </div>
  )
}

export default function MarketDetailPage() {
  const params = useParams<{ symbol: string }>()
  const base = decodeURIComponent(params?.symbol ?? 'BTC').toUpperCase()
  const market = findSymbol(base) ?? MARKET_SYMBOLS[0]

  const [timeframe, setTimeframe] = useState<Timeframe>('1h')
  const [tab, setTab] = useState<Tab>('Overview')

  const {
    ticker,
    candles,
    book,
    trades,
    mark,
    fundingHistory,
    openInterest,
    loading,
    error,
    status,
    refresh,
  } = useMarketWorkspace(market.base, timeframe, {
    candleLimit: 180,
    bookLimit: 20,
    tradeLimit: 26,
  })

  const feed = useMarketProfile()

  // Funding is a futures concept. When the app is reading Binance's spot feed the
  // tab is dropped rather than left sitting there permanently empty.
  const visibleTabs = feed.derivatives ? TABS : TABS.filter((option) => option !== 'Funding')

  const changePct = ticker?.changePct ?? 0
  const positive = changePct >= 0

  const indicators = useMemo(() => {
    const rsiValue = rsi(candles)
    const sma20 = average(candles, 20)
    const sma50 = average(candles, 50)
    const last = candles[candles.length - 1]?.c ?? 0
    const swings = candles.slice(-48).map((candle) => candle.h - candle.l)
    const atr = swings.length ? swings.reduce((sum, value) => sum + value, 0) / swings.length : 0
    return { rsiValue, sma20, sma50, last, atr }
  }, [candles])

  const depthMax = useMemo(() => {
    if (!book) return 1
    return Math.max(...book.bids.map((level) => level.total), ...book.asks.map((level) => level.total), 1)
  }, [book])

  const maSignal = useMemo(() => {
    if (!indicators.sma20 || !indicators.sma50) return null
    if (indicators.sma20 > indicators.sma50) return 'SMA 20 above SMA 50'
    return 'SMA 20 below SMA 50'
  }, [indicators])

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={ROUTES.markets}
            className="flex items-center gap-1.5 text-[12.5px] text-ink-3 transition-colors hover:text-accent"
          >
            <ArrowLeft size={12} aria-hidden />
            All contracts
          </Link>
          <span className="text-ink-3" aria-hidden>
            /
          </span>
          <span className="num text-[12.5px] text-ink-2">{market.pair}</span>

          <span className="ml-auto flex items-center gap-3">
            <span
              className="num text-[10.5px] uppercase tracking-[0.12em]"
              style={{ color: status === 'open' ? 'var(--color-long)' : 'var(--color-ink-3)' }}
            >
              {status === 'open'
                ? feed.derivatives
                  ? 'Streaming futures'
                  : 'Streaming spot'
                : status === 'closed'
                  ? 'Offline'
                  : 'Connecting'}
            </span>
            {status === 'open' && <span className="live-pip" aria-hidden />}
            <button
              type="button"
              onClick={refresh}
              className="btn btn-ghost size-8"
              aria-label="Re-sync market data"
            >
              <ArrowsClockwise size={13} aria-hidden />
            </button>
          </span>
        </div>

        {/* Symbol header */}
        <section className="mt-5 grid gap-6 border-b border-line pb-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{market.base}</h1>
              <span className="pill">USDT perpetual</span>
            </div>
            <p className="mt-1.5 text-[13px] text-ink-3">{market.name}</p>

            <div className="mt-5 flex flex-wrap items-baseline gap-4">
              <span className="num text-[34px] leading-none font-semibold tracking-tight text-ink">
                {ticker ? formatPrice(ticker.price) : '...'}
              </span>
              {ticker && <ChangeTag value={changePct} size="lg" />}
            </div>

            <p className="mt-3 text-[12px] text-ink-3">
              {ticker
                ? `24h range ${formatPrice(ticker.low)} to ${formatPrice(ticker.high)}`
                : 'Waiting for the ticker snapshot'}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={ROUTES.liveComp(1)} className="btn btn-primary px-4 py-2.5">
                Trade {market.base}
                <ArrowRight size={13} aria-hidden />
              </Link>
              <Link href={ROUTES.competitions} className="btn btn-ghost px-4 py-2.5">
                Rounds on {market.base}
              </Link>
            </div>
          </div>

          {/*
            The headline stats swap wholesale with the feed. On futures they lead
            with mark price and funding, which is what a perp trader watches. On
            spot those fields do not exist, so showing them would mean four cells
            stuck on a placeholder forever. The spot set leads with the last price
            and the session range instead.
          */}
          <dl className="grid grid-cols-2 divide-line overflow-hidden rounded-card border border-line bg-surface md:grid-cols-3 md:divide-x md:divide-y-0 lg:grid-cols-3">
            {feed.derivatives ? (
              <>
                <div className="divide-y divide-line md:col-span-1">
                  <StatCell label="Mark price" value={mark ? formatPrice(mark.markPrice) : '...'} />
                  <StatCell label="Index price" value={mark ? formatPrice(mark.indexPrice) : '...'} />
                </div>
                <div className="divide-y divide-line">
                  <StatCell
                    label="Funding rate"
                    value={mark ? formatPctPlain(mark.fundingRatePct) : '...'}
                    tone={mark && mark.fundingRatePct >= 0 ? 'var(--color-long)' : 'var(--color-short)'}
                  />
                  <StatCell
                    label="Next funding"
                    value={mark ? formatClock(mark.nextFundingTime, false) : '...'}
                  />
                </div>
                <div className="divide-y divide-line">
                  <StatCell label="24h volume" value={ticker ? formatUsd(ticker.quoteVolume) : '...'} />
                  <StatCell
                    label="Open interest"
                    value={openInterest ? `${formatQty(openInterest.value, 0)} ${market.base}` : '...'}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="divide-y divide-line md:col-span-1">
                  <StatCell label="Last price" value={ticker ? formatPrice(ticker.price) : '...'} />
                  <StatCell label="24h high" value={ticker ? formatPrice(ticker.high) : '...'} />
                </div>
                <div className="divide-y divide-line">
                  <StatCell label="24h low" value={ticker ? formatPrice(ticker.low) : '...'} />
                  <StatCell label="VWAP 24h" value={ticker ? formatPrice(ticker.vwap) : '...'} />
                </div>
                <div className="divide-y divide-line">
                  <StatCell label="24h volume" value={ticker ? formatUsd(ticker.quoteVolume) : '...'} />
                  <StatCell label="Fills 24h" value={ticker ? formatNumber(ticker.trades) : '...'} />
                </div>
              </>
            )}
          </dl>
        </section>

        {error && !ticker ? (
          <div className="panel mt-5">
            <ErrorState
              title="Binance feed unavailable"
              message={error}
              onRetry={refresh}
            />
          </div>
        ) : (
          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Chart and statistics */}
            <div className="flex flex-col gap-5">
              <div className="panel overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="num text-[13px] text-ink">{market.pair}</span>
                    <span className="label">{timeframe}</span>
                    {loading && <span className="num text-[11px] text-ink-3">loading</span>}
                  </div>
                  <div role="group" aria-label="Chart interval" className="flex gap-1">
                    {TIMEFRAMES.map((option) => {
                      const selected = option === timeframe
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTimeframe(option)}
                          aria-pressed={selected}
                          className="num rounded-control px-2.5 py-1.5 text-[11.5px] transition-colors"
                          style={{
                            color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                            backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                          }}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="px-2 py-3">
                  <CandlestickChart candles={candles} height={400} volume axis />
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line px-4 py-2.5">
                  <span className="num text-[11px] text-ink-3">
                    Last {formatClock(ticker?.updatedAt ?? 0)}
                  </span>
                  <span className="num text-[11px] text-ink-3">
                    {formatNumber(candles.length)} periods loaded
                  </span>
                  <span className="num ml-auto text-[11px] text-ink-3">
                    {status === 'open' ? 'Live' : 'Polling'}
                  </span>
                </div>
              </div>

              <div className="panel overflow-hidden">
                <div role="tablist" aria-label="Market statistics" className="flex overflow-x-auto border-b border-line px-1.5 py-1.5">
                  {visibleTabs.map((option) => {
                    const selected = option === tab
                    return (
                      <button
                        key={option}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setTab(option)}
                        className="rounded-control px-3.5 py-2 text-[12.5px] font-medium whitespace-nowrap transition-colors"
                        style={{
                          color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                          backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>

                {tab === 'Overview' && (
                  <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['24h open', ticker ? formatPrice(ticker.price - ticker.priceChange) : '...'],
                      ['24h change', ticker ? `${formatPrice(Math.abs(ticker.priceChange))} (${changePct.toFixed(2)}%)` : '...'],
                      ['24h high', ticker ? formatPrice(ticker.high) : '...'],
                      ['24h low', ticker ? formatPrice(ticker.low) : '...'],
                      ['VWAP 24h', ticker ? formatPrice(ticker.vwap) : '...'],
                      ['Fills 24h', ticker ? formatNumber(ticker.trades) : '...'],
                      ['Base volume', ticker ? `${formatQty(ticker.volume, 2)} ${market.base}` : '...'],
                      ['Quote volume', ticker ? formatUsd(ticker.quoteVolume) : '...'],
                    ]
                      // Open interest is futures-only, so the row is omitted on spot
                      // rather than rendering a permanent placeholder.
                      .concat(
                        feed.derivatives
                          ? [
                              [
                                'Open interest',
                                openInterest
                                  ? `${formatQty(openInterest.value, 2)} ${market.base}`
                                  : '...',
                              ],
                            ]
                          : [],
                      )
                      .map(([label, value]) => (
                      <div key={label} className="bg-surface px-4 py-4">
                        <p className="label">{label}</p>
                        <p className="num mt-2 text-[14px] text-ink">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'Funding' && feed.derivatives && (
                  <div>
                    <div className="grid grid-cols-3 border-b border-line px-4 py-2.5">
                      <span className="label">Settled at</span>
                      <span className="label text-right">Rate</span>
                      <span className="label text-right">Who pays</span>
                    </div>
                    {fundingHistory.length === 0 && (
                      <p className="px-4 py-10 text-center text-[13px] text-ink-2">
                        No funding settlements returned for this contract yet.
                      </p>
                    )}
                    {fundingHistory.map((point) => (
                      <div
                        key={point.time}
                        className="grid grid-cols-3 items-center border-b border-line px-4 py-2.5 last:border-b-0"
                      >
                        <span className="num text-[12.5px] text-ink-3">
                          {formatClock(point.time, false)}
                        </span>
                        <span
                          className="num text-right text-[12.5px]"
                          style={{
                            color: point.ratePct >= 0 ? 'var(--color-long)' : 'var(--color-short)',
                          }}
                        >
                          {formatPctPlain(point.ratePct)}
                        </span>
                        <span className="text-right text-[12px] text-ink-3">
                          {point.ratePct >= 0 ? 'Longs pay shorts' : 'Shorts pay longs'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'Technicals' && (
                  <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: 'RSI 14',
                        value: indicators.rsiValue !== null ? indicators.rsiValue.toFixed(1) : '...',
                        note:
                          indicators.rsiValue === null
                            ? 'Needs 15 periods'
                            : indicators.rsiValue >= 70
                              ? 'Above 70, stretched'
                              : indicators.rsiValue <= 30
                                ? 'Below 30, stretched'
                                : 'Between 30 and 70',
                      },
                      {
                        label: 'SMA 20',
                        value: indicators.sma20 ? formatPrice(indicators.sma20) : '...',
                        note: indicators.last && indicators.sma20
                          ? indicators.last >= indicators.sma20
                            ? 'Price above'
                            : 'Price below'
                          : 'Needs 20 periods',
                      },
                      {
                        label: 'SMA 50',
                        value: indicators.sma50 ? formatPrice(indicators.sma50) : '...',
                        note: maSignal ?? 'Needs 50 periods',
                      },
                      {
                        label: 'Range 48',
                        value: indicators.atr ? formatPrice(indicators.atr) : '...',
                        note: 'Mean high to low, last 48 periods',
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-surface px-4 py-4">
                        <p className="label">{item.label}</p>
                        <p className="num mt-2 text-[16px] text-ink">{item.value}</p>
                        <p className="mt-1.5 text-[11.5px] text-ink-3">{item.note}</p>
                      </div>
                    ))}
                    <p className="bg-surface px-4 py-3 text-[11.5px] text-ink-3 sm:col-span-2 lg:col-span-4">
                      Computed from the {timeframe} candle series currently loaded, which covers roughly
                      the last {candles.length} periods. Nothing here is a prediction.
                    </p>
                  </div>
                )}

                {tab === 'Sessions' && (
                  <div className="divide-y divide-line">
                    <div className="flex items-start gap-3 px-4 py-4">
                      <Info size={14} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
                      <p className="text-[13px] leading-relaxed text-ink-2">
                        Binance USD-M futures trade continuously, so there is no opening or closing
                        auction to lean on. Funding settles every eight hours, and the 24 hour window
                        above is a rolling one rather than a session.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-3">
                      <span className="label">Last update</span>
                      <span className="label text-right">Time</span>
                      <span className="label text-right">Age</span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-[12.5px] text-ink-2">Ticker</span>
                      <span className="num text-right text-[12.5px] text-ink">
                        {formatClock(ticker?.updatedAt ?? 0)}
                      </span>
                      <span className="num text-right text-[12.5px] text-ink-3">
                        {formatRelative(ticker?.updatedAt ?? 0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-[12.5px] text-ink-2">Mark and funding</span>
                      <span className="num text-right text-[12.5px] text-ink">
                        {formatClock(mark?.updatedAt ?? 0)}
                      </span>
                      <span className="num text-right text-[12.5px] text-ink-3">
                        {formatRelative(mark?.updatedAt ?? 0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-[12.5px] text-ink-2">Open interest</span>
                      <span className="num text-right text-[12.5px] text-ink">
                        {formatClock(openInterest?.time ?? 0)}
                      </span>
                      <span className="num text-right text-[12.5px] text-ink-3">
                        {formatRelative(openInterest?.time ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Book, depth and tape */}
            <aside className="flex flex-col gap-5">
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <span className="text-[13px] text-ink-2">Order book</span>
                  <span className="num text-[11px] text-ink-3">
                    {book ? formatPctPlain(book.spreadPct) : '...'} spread
                  </span>
                </div>

                <div className="grid grid-cols-3 px-4 py-2">
                  <span className="label">Price</span>
                  <span className="label text-right">Size</span>
                  <span className="label text-right">Total</span>
                </div>

                <div>
                  {[...(book?.asks ?? [])].reverse().map((level) => (
                    <div
                      key={`ask-${level.price}`}
                      className="relative grid grid-cols-3 px-4 py-1"
                    >
                      <span
                        className="pointer-events-none absolute inset-y-0 right-0"
                        style={{
                          width: `${(level.total / depthMax) * 100}%`,
                          backgroundColor: 'rgba(248, 113, 113, 0.09)',
                        }}
                      />
                      <span className="num relative text-[12px] text-short">
                        {formatPrice(level.price)}
                      </span>
                      <span className="num relative text-right text-[12px] text-ink-2">
                        {formatQty(level.qty, 3)}
                      </span>
                      <span className="num relative text-right text-[12px] text-ink-3">
                        {formatQty(level.total, 3)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-baseline justify-between border-y border-line bg-surface-2 px-4 py-2.5">
                  <span className="num text-[17px] font-semibold" style={{ color: positive ? 'var(--color-long)' : 'var(--color-short)' }}>
                    {ticker ? formatPrice(ticker.price) : '...'}
                  </span>
                  <ChangeTag value={changePct} size="sm" />
                </div>

                <div>
                  {book?.bids.map((level) => (
                    <div
                      key={`bid-${level.price}`}
                      className="relative grid grid-cols-3 px-4 py-1"
                    >
                      <span
                        className="pointer-events-none absolute inset-y-0 right-0"
                        style={{
                          width: `${(level.total / depthMax) * 100}%`,
                          backgroundColor: 'rgba(52, 211, 153, 0.09)',
                        }}
                      />
                      <span className="num relative text-[12px] text-long">
                        {formatPrice(level.price)}
                      </span>
                      <span className="num relative text-right text-[12px] text-ink-2">
                        {formatQty(level.qty, 3)}
                      </span>
                      <span className="num relative text-right text-[12px] text-ink-3">
                        {formatQty(level.total, 3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel overflow-hidden">
                <div className="border-b border-line px-4 py-3">
                  <span className="text-[13px] text-ink-2">Cumulative depth</span>
                </div>
                <div className="px-4 py-4">
                  <DepthChart bids={book?.bids ?? []} asks={book?.asks ?? []} height={132} />
                </div>
              </div>

              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <span className="text-[13px] text-ink-2">Recent fills</span>
                  <span className="num text-[11px] text-ink-3">{trades.length} shown</span>
                </div>
                <div>
                  {trades.length === 0 && (
                    <p className="px-4 py-8 text-center text-[12.5px] text-ink-2">
                      No fills reported yet.
                    </p>
                  )}
                  {trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="grid grid-cols-3 border-b border-line px-4 py-1.5 last:border-b-0"
                    >
                      <span
                        className="num text-[12px]"
                        style={{
                          color: trade.side === 'buy' ? 'var(--color-long)' : 'var(--color-short)',
                        }}
                      >
                        {formatPrice(trade.price)}
                      </span>
                      <span className="num text-right text-[12px] text-ink-2">
                        {formatQty(trade.qty, 4)}
                      </span>
                      <span className="num text-right text-[12px] text-ink-3">
                        {formatClock(trade.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel p-4">
                <p className="text-[13px] text-ink-2">Contract details</p>
                <dl className="mt-3 flex flex-col">
                  <div className="flex items-center justify-between border-b border-line py-2">
                    <dt className="text-[12px] text-ink-3">Symbol</dt>
                    <dd className="num text-[12px] text-ink">{market.symbol}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-line py-2">
                    <dt className="text-[12px] text-ink-3">Margin asset</dt>
                    <dd className="num text-[12px] text-ink">USDT</dd>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-[12px] text-ink-3">Tick source</dt>
                    <dd className="num text-[12px] text-ink">Binance futures</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  )
}
