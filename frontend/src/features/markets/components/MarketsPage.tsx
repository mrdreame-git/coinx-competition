'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowsClockwise, CaretDown, CaretUp, MagnifyingGlass, X } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { useLiveTickers, useSparklines } from '@/lib/binance/hooks'
import { MARKET_SYMBOLS } from '@/lib/binance/symbols'
import type { Ticker24h } from '@/lib/binance/types'
import { formatClock, formatNumber, formatPrice, formatUsd } from '@/lib/format'
import Header from '@/components/layout/Header'
import Sparkline from '@/components/common/Sparkline'
import ChangeTag from '@/components/common/ChangeTag'
import { ErrorState, TableSkeleton } from '@/components/common/StatePanel'

type Filter = 'all' | 'gainers' | 'losers' | 'majors'
type SortKey = 'pair' | 'price' | 'change' | 'high' | 'low' | 'quoteVolume'
type SortDir = 'asc' | 'desc'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All contracts' },
  { key: 'majors', label: 'Majors' },
  { key: 'gainers', label: 'Up 24h' },
  { key: 'losers', label: 'Down 24h' },
]

const MAJORS = ['BTC', 'ETH', 'SOL', 'BNB']

const COLUMNS: { key: SortKey | null; label: string; align: 'left' | 'right' }[] = [
  { key: 'pair', label: 'Contract', align: 'left' },
  { key: 'price', label: 'Last', align: 'right' },
  { key: 'change', label: '24h change', align: 'right' },
  { key: 'high', label: '24h high', align: 'right' },
  { key: 'low', label: '24h low', align: 'right' },
  { key: 'quoteVolume', label: '24h volume', align: 'right' },
  { key: null, label: 'Trend', align: 'right' },
]

const GRID = 'minmax(0,1.4fr) 140px 108px 132px 132px 132px 104px'

export default function MarketsPage() {
  const { tickers, loading, error, status, updatedAt, refresh } = useLiveTickers()
  const { sparklines } = useSparklines(MARKET_SYMBOLS.map((market) => market.base))

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('quoteVolume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase()

    let list = tickers.filter((ticker) => ticker.price > 0)

    if (needle) {
      list = list.filter(
        (ticker) =>
          ticker.base.toLowerCase().includes(needle) ||
          ticker.name.toLowerCase().includes(needle),
      )
    }

    if (filter === 'majors') list = list.filter((ticker) => MAJORS.includes(ticker.base))
    if (filter === 'gainers') list = list.filter((ticker) => ticker.changePct > 0)
    if (filter === 'losers') list = list.filter((ticker) => ticker.changePct < 0)

    const read = (ticker: Ticker24h) => {
      switch (sortKey) {
        case 'pair':
          return ticker.base
        case 'price':
          return ticker.price
        case 'change':
          return ticker.changePct
        case 'high':
          return ticker.high
        case 'low':
          return ticker.low
        default:
          return ticker.quoteVolume
      }
    }

    return [...list].sort((a, b) => {
      const left = read(a)
      const right = read(b)
      if (typeof left === 'string' && typeof right === 'string') {
        return sortDir === 'asc' ? left.localeCompare(right) : right.localeCompare(left)
      }
      return sortDir === 'asc'
        ? Number(left) - Number(right)
        : Number(right) - Number(left)
    })
  }, [tickers, search, filter, sortKey, sortDir])

  const totals = useMemo(
    () => ({
      volume: tickers.reduce((sum, ticker) => sum + ticker.quoteVolume, 0),
      advancing: tickers.filter((ticker) => ticker.changePct > 0).length,
      declining: tickers.filter((ticker) => ticker.changePct < 0).length,
    }),
    [tickers],
  )

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'pair' ? 'asc' : 'desc')
  }

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label">USDT-margined perpetuals</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Markets
            </h1>
            <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">
              {MARKET_SYMBOLS.length} contracts priced live from the Binance futures feed.
              {tickers.length > 0 && ` ${totals.advancing} up and ${totals.declining} down over the last 24 hours.`}
            </p>
          </div>

          <dl className="flex divide-x divide-line">
            <div className="px-5 first:pl-0">
              <dt className="label">Universe volume</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">
                {totals.volume ? formatUsd(totals.volume) : '...'}
              </dd>
            </div>
            <div className="px-5 last:pr-0">
              <dt className="label">Feed</dt>
              <dd className="mt-2 flex items-center gap-2">
                <span
                  className="num text-[13px]"
                  style={{ color: status === 'open' ? 'var(--color-long)' : 'var(--color-ink-3)' }}
                >
                  {status === 'open' ? 'Streaming' : status === 'closed' ? 'Offline' : 'Connecting'}
                </span>
                {updatedAt > 0 && (
                  <span className="num text-[11px] text-ink-3">{formatClock(updatedAt)}</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Filters and search */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div role="tablist" aria-label="Filter contracts" className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => {
              const selected = filter === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.key)}
                  className="rounded-control px-3 py-2 text-[12.5px] font-medium transition-colors"
                  style={{
                    color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                    backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass
                size={13}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
                aria-hidden
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter by symbol or name"
                aria-label="Filter contracts by symbol or name"
                className="field num w-[230px] py-2 pl-8 text-[12.5px]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear filter"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-3 hover:text-ink"
                >
                  <X size={12} aria-hidden />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={refresh}
              className="btn btn-ghost size-9"
              aria-label="Refresh market data"
            >
              <ArrowsClockwise size={14} aria-hidden />
            </button>
          </div>
        </div>

        {/* Table on desktop, cards on mobile (explicit per-section collapse). */}
        {error && tickers.length === 0 ? (
          <div className="panel mt-6">
            <ErrorState message={error} onRetry={refresh} />
          </div>
        ) : loading && tickers.length === 0 ? (
          <div className="panel mt-6 overflow-hidden">
            <TableSkeleton rows={8} columns={7} />
          </div>
        ) : (
          <>
            <div className="panel mt-6 hidden overflow-hidden lg:block">
              <div
                className="grid items-center gap-4 border-b border-line bg-surface-2/60 px-4 py-2.5"
                style={{ gridTemplateColumns: GRID }}
              >
                {COLUMNS.map((column) => (
                  <div
                    key={column.label}
                    className={column.align === 'right' ? 'flex justify-end' : undefined}
                  >
                    {column.key ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key as SortKey)}
                        aria-label={`Sort by ${column.label}`}
                        className="label flex items-center gap-1 transition-colors hover:text-ink"
                        style={{ color: sortKey === column.key ? 'var(--color-accent)' : undefined }}
                      >
                        {column.label}
                        {sortKey === column.key &&
                          (sortDir === 'asc' ? (
                            <CaretUp size={9} weight="bold" aria-hidden />
                          ) : (
                            <CaretDown size={9} weight="bold" aria-hidden />
                          ))}
                      </button>
                    ) : (
                      <span className="label">{column.label}</span>
                    )}
                  </div>
                ))}
              </div>

              {rows.length === 0 && (
                <p className="px-4 py-14 text-center text-[13px] text-ink-2">
                  No contract matches that filter. Clear the search or switch back to all contracts.
                </p>
              )}

              {rows.map((ticker) => (
                <Link
                  key={ticker.symbol}
                  href={ROUTES.marketDetail(ticker.base)}
                  className="grid items-center gap-4 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                  style={{ gridTemplateColumns: GRID }}
                >
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span className="text-[14px] font-semibold text-ink">{ticker.base}</span>
                    <span className="truncate text-[12.5px] text-ink-3">{ticker.name}</span>
                    <span className="pill">Perp</span>
                  </div>
                  <span className="num text-right text-[13px] text-ink">
                    {formatPrice(ticker.price)}
                  </span>
                  <span className="flex justify-end">
                    <ChangeTag value={ticker.changePct} size="sm" />
                  </span>
                  <span className="num text-right text-[13px] text-ink-2">
                    {formatPrice(ticker.high)}
                  </span>
                  <span className="num text-right text-[13px] text-ink-2">
                    {formatPrice(ticker.low)}
                  </span>
                  <span className="num text-right text-[13px] text-ink-2">
                    {formatUsd(ticker.quoteVolume)}
                  </span>
                  <span className="flex justify-end">
                    <Sparkline
                      data={sparklines[ticker.base] ?? []}
                      positive={ticker.changePct >= 0}
                      width={92}
                      height={26}
                    />
                  </span>
                </Link>
              ))}
            </div>

            {/* Mobile card list */}
            <div className="mt-6 grid gap-3 lg:hidden">
              {rows.length === 0 && (
                <p className="panel px-4 py-12 text-center text-[13px] text-ink-2">
                  No contract matches that filter.
                </p>
              )}
              {rows.map((ticker) => (
                <Link
                  key={ticker.symbol}
                  href={ROUTES.marketDetail(ticker.base)}
                  className="panel p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{ticker.base}</p>
                      <p className="mt-0.5 text-[12px] text-ink-3">{ticker.name}</p>
                    </div>
                    <ChangeTag value={ticker.changePct} size="sm" />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="num text-[17px] font-semibold text-ink">
                      {formatPrice(ticker.price)}
                    </span>
                    <Sparkline
                      data={sparklines[ticker.base] ?? []}
                      positive={ticker.changePct >= 0}
                      width={80}
                      height={24}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
                    <div>
                      <dt className="label">High</dt>
                      <dd className="num mt-1 text-[12px] text-ink-2">{formatPrice(ticker.high)}</dd>
                    </div>
                    <div>
                      <dt className="label">Low</dt>
                      <dd className="num mt-1 text-[12px] text-ink-2">{formatPrice(ticker.low)}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="label">Volume</dt>
                      <dd className="num mt-1 text-[12px] text-ink-2">
                        {formatUsd(ticker.quoteVolume)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          </>
        )}

        <p className="mt-5 text-[11.5px] leading-relaxed text-ink-3">
          Prices, ranges and volumes are the rolling 24 hour figures reported by Binance for each
          contract. Trend lines plot hourly closes over the same window.
          {rows.length > 0 && ` Showing ${formatNumber(rows.length)} of ${formatNumber(tickers.length)} contracts.`}
        </p>
      </main>
    </div>
  )
}
