'use client'

import { useMemo, useState } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { COMPETITIONS } from '@/mocks/competitions'
import { useLiveTickers } from '@/lib/binance/hooks'
import { formatNumber, formatUsd } from '@/lib/format'
import type { CompetitionStatus } from '@/types/competition'
import Header from '@/components/layout/Header'
import CompetitionCard from '@/features/competitions/components/CompetitionCard'
import { EmptyState, CardSkeleton } from '@/components/common/StatePanel'

type Filter = 'taking' | 'live' | 'settled' | 'all'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'taking', label: 'Taking entrants' },
  { key: 'live', label: 'Running now' },
  { key: 'settled', label: 'Settled' },
  { key: 'all', label: 'All rounds' },
]

function baseOf(pair: string): string {
  return pair.split('/')[0]?.trim().toUpperCase() ?? ''
}

function matches(status: CompetitionStatus, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'taking') return status === 'upcoming'
  if (filter === 'live') return status === 'live'
  return status === 'finished'
}

export default function CompetitionsPage() {
  const { byBase, tickers } = useLiveTickers()
  const [filter, setFilter] = useState<Filter>('taking')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return COMPETITIONS.filter((comp) => matches(comp.status, filter)).filter(
      (comp) =>
        !needle ||
        comp.name.toLowerCase().includes(needle) ||
        comp.pair.toLowerCase().includes(needle),
    )
  }, [filter, search])

  const totals = useMemo(() => {
    const open = COMPETITIONS.filter((comp) => comp.status !== 'finished')
    return {
      open: open.length,
      live: COMPETITIONS.filter((comp) => comp.status === 'live').length,
      pooled: open.reduce((sum, comp) => sum + comp.prize, 0),
      seats: open.reduce((sum, comp) => sum + (comp.maxPlayers - comp.players), 0),
    }
  }, [])

  const universeVolume = tickers.reduce((sum, ticker) => sum + ticker.quoteVolume, 0)

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label">Timed trading rounds</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Competitions
            </h1>
            <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-ink-2">
              Every round fixes the pair, the window and the entry fee before it opens. Percent
              return decides the board, and the prize pool pays the top twenty.
            </p>
          </div>

          <dl className="flex flex-wrap divide-x divide-line">
            <div className="px-5 first:pl-0">
              <dt className="label">Open rounds</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">{totals.open}</dd>
            </div>
            <div className="px-5">
              <dt className="label">Running now</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">{totals.live}</dd>
            </div>
            <div className="px-5">
              <dt className="label">Seats left</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">
                {formatNumber(totals.seats)}
              </dd>
            </div>
            <div className="px-5 last:pr-0">
              <dt className="label">Pools listed</dt>
              <dd className="num mt-2 text-[19px] font-semibold text-ink">
                {formatUsd(totals.pooled, 0)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <div role="tablist" aria-label="Filter rounds" className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => {
              const selected = filter === item.key
              const count = COMPETITIONS.filter((comp) => matches(comp.status, item.key)).length
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(item.key)}
                  className="flex items-center gap-2 rounded-control px-3 py-2 text-[12.5px] font-medium transition-colors"
                  style={{
                    color: selected ? 'var(--color-accent)' : 'var(--color-ink-3)',
                    backgroundColor: selected ? 'var(--color-accent-soft)' : 'transparent',
                  }}
                >
                  {item.label}
                  <span className="num text-[11px] text-ink-3">{count}</span>
                </button>
              )
            })}
          </div>

          <div className="relative ml-auto">
            <MagnifyingGlass
              size={13}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
              aria-hidden
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter by name or pair"
              aria-label="Filter competitions"
              className="field w-[240px] py-2 pl-8 text-[12.5px]"
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
        </div>

        {tickers.length === 0 && !search ? (
          <div className="mt-6">
            <CardSkeleton count={6} height={320} />
          </div>
        ) : rows.length === 0 ? (
          <div className="panel mt-6">
            <EmptyState
              title="No round matches that filter"
              body="Try the settled tab to review completed rounds, or clear the search to see everything currently listed."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((comp) => (
              <CompetitionCard
                key={comp.id}
                comp={comp}
                ticker={byBase.get(baseOf(comp.pair))}
              />
            ))}
          </div>
        )}

        <p className="mt-6 text-[11.5px] leading-relaxed text-ink-3">
          Pools, entry fees and seat counts are competition figures held by the platform. Prices and
          24 hour changes on each card come from Binance, and the universe has traded{' '}
          {universeVolume ? formatUsd(universeVolume) : '...'} over the last 24 hours.
        </p>
      </main>
    </div>
  )
}
