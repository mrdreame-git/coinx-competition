'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  DownloadSimple,
  Trophy,
  UploadSimple,
} from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { useAuth } from '@/features/auth/auth-context'
import { useLiveTickers, useSparklines } from '@/lib/binance/hooks'
import { FEATURED_BASES, findSymbol } from '@/lib/binance/symbols'
import { COMPETITIONS } from '@/mocks/competitions'
import { TRANSACTIONS } from '@/mocks/wallet'
import { formatCompact, formatNumber, formatPrice, formatRelative, formatUsd } from '@/lib/format'
import Header from '@/components/layout/Header'
import Sparkline from '@/components/common/Sparkline'
import ChangeTag from '@/components/common/ChangeTag'
import StatusBadge from '@/components/common/StatusBadge'
import { TableSkeleton } from '@/components/common/StatePanel'

/** Account figures are simulated: there is no ledger behind this prototype. */
const ACCOUNT = {
  balance: 1250,
  locked: 285,
  won: 7,
  bestReturn: 31.42,
  prizes: 8420,
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { tickers, byBase, status, error, refresh } = useLiveTickers()
  const { sparklines } = useSparklines([...FEATURED_BASES])

  const active = useMemo(
    () => COMPETITIONS.filter((comp) => comp.status !== 'finished').slice(0, 3),
    [],
  )

  const watchlist = useMemo(
    () =>
      tickers
        .filter((ticker) => ticker.price > 0)
        .sort((a, b) => b.quoteVolume - a.quoteVolume)
        .slice(0, 6),
    [tickers],
  )

  const movers = useMemo(
    () =>
      [...tickers]
        .filter((ticker) => ticker.price > 0)
        .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
        .slice(0, 3),
    [tickers],
  )

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[13px] text-ink-3">Signed in as {user.email}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.wallet} className="btn btn-primary px-4 py-2.5">
              <DownloadSimple size={13} aria-hidden />
              Deposit
            </Link>
            <Link href={ROUTES.competitions} className="btn btn-ghost px-4 py-2.5">
              Find a round
              <ArrowRight size={13} aria-hidden />
            </Link>
          </div>
        </div>

        {/* Account summary. Simulated, and labelled as such below. */}
        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-card border border-line bg-surface p-6">
            <p className="label">Wallet balance</p>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="num text-[38px] leading-none font-semibold tracking-tight text-ink">
                {formatNumber(ACCOUNT.balance, 2)}
              </span>
              <span className="num text-[13px] text-ink-3">USDT</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-6 border-t border-line pt-5">
              <div>
                <p className="label">Locked in rounds</p>
                <p className="num mt-2 text-[15px] text-ink-2">
                  {formatNumber(ACCOUNT.locked, 2)} USDT
                </p>
              </div>
              <div>
                <p className="label">Available</p>
                <p className="num mt-2 text-[15px] text-ink-2">
                  {formatNumber(ACCOUNT.balance - ACCOUNT.locked, 2)} USDT
                </p>
              </div>
              <div>
                <p className="label">Withdrawable</p>
                <p className="num mt-2 text-[15px] text-ink-2">
                  {formatNumber(ACCOUNT.balance - ACCOUNT.locked, 2)} USDT
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={ROUTES.wallet} className="btn btn-secondary px-3.5 py-2">
                <DownloadSimple size={12} aria-hidden />
                Deposit
              </Link>
              <Link href={ROUTES.wallet} className="btn btn-ghost px-3.5 py-2">
                <UploadSimple size={12} aria-hidden />
                Withdraw
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { label: 'Rounds won', value: formatNumber(ACCOUNT.won), note: 'All time' },
              {
                label: 'Best return',
                value: `+${ACCOUNT.bestReturn.toFixed(2)}%`,
                note: 'Single round',
              },
              { label: 'Prizes paid', value: formatUsd(ACCOUNT.prizes), note: 'Credited' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-card border border-line bg-surface p-5">
                <p className="label">{stat.label}</p>
                <p className="num mt-3 text-[22px] font-semibold tracking-tight text-ink">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11.5px] text-ink-3">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live market table */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Most active contracts</h2>
              <p className="mt-1.5 text-[13px] text-ink-3">
                Ranked by 24 hour quote volume, live from Binance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="num text-[10.5px] uppercase tracking-[0.12em]"
                style={{ color: status === 'open' ? 'var(--color-long)' : 'var(--color-ink-3)' }}
              >
                {status === 'open' ? 'Streaming' : 'Connecting'}
              </span>
              <Link href={ROUTES.markets} className="btn btn-ghost px-3 py-2 text-[12px]">
                All markets
                <ArrowRight size={12} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="panel mt-5 overflow-hidden">
            {watchlist.length === 0 ? (
              <TableSkeleton rows={6} columns={5} />
            ) : (
              <>
                <div
                  className="hidden items-center gap-4 border-b border-line bg-surface-2/60 px-4 py-2.5 lg:grid"
                  style={{ gridTemplateColumns: 'minmax(0,1.2fr) 130px 110px 130px 110px' }}
                >
                  <span className="label">Contract</span>
                  <span className="label text-right">Last</span>
                  <span className="label text-right">24h</span>
                  <span className="label text-right">Volume</span>
                  <span className="label text-right">Trend</span>
                </div>
                {watchlist.map((ticker) => (
                  <Link
                    key={ticker.symbol}
                    href={ROUTES.marketDetail(ticker.base)}
                    className="grid items-center gap-4 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                    style={{ gridTemplateColumns: 'minmax(0,1.2fr) 130px 110px 130px 110px' }}
                  >
                    <div className="flex min-w-0 items-baseline gap-2.5">
                      <span className="text-[13.5px] font-semibold text-ink">{ticker.base}</span>
                      <span className="truncate text-[12px] text-ink-3">{ticker.name}</span>
                    </div>
                    <span className="num text-right text-[13px] text-ink">
                      {formatPrice(ticker.price)}
                    </span>
                    <span className="flex justify-end">
                      <ChangeTag value={ticker.changePct} size="sm" caret={false} />
                    </span>
                    <span className="num text-right text-[12.5px] text-ink-2">
                      {formatUsd(ticker.quoteVolume)}
                    </span>
                    <span className="flex justify-end">
                      <Sparkline
                        data={sparklines[ticker.base] ?? []}
                        positive={ticker.changePct >= 0}
                        width={80}
                        height={22}
                      />
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {movers.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {movers.map((ticker) => (
                <Link
                  key={ticker.symbol}
                  href={ROUTES.marketDetail(ticker.base)}
                  className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{ticker.base}</p>
                    <p className="num mt-1 text-[11.5px] text-ink-3">
                      {formatPrice(ticker.price)}
                    </p>
                  </div>
                  <ChangeTag value={ticker.changePct} size="sm" />
                </Link>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-4 text-[12px] text-short">
              {error}{' '}
              <button type="button" onClick={refresh} className="underline">
                Retry
              </button>
            </p>
          )}
        </section>

        {/* Rounds in progress and account activity */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Your rounds</h2>
              <Link href={ROUTES.competitions} className="btn btn-ghost px-3 py-2 text-[12px]">
                Browse rounds
                <ArrowRight size={12} aria-hidden />
              </Link>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {active.map((comp) => {
                const base = comp.pair.split('/')[0]?.trim().toUpperCase() ?? ''
                const ticker = byBase.get(base)
                const symbol = findSymbol(base)
                const href =
                  comp.status === 'live'
                    ? ROUTES.liveComp(comp.id)
                    : ROUTES.compLobby(comp.id)

                return (
                  <div key={comp.id} className="panel p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="num text-[11px] text-ink-3">{comp.pair}</p>
                        <h3 className="mt-1.5 text-[15px] font-semibold text-ink">{comp.name}</h3>
                      </div>
                      <StatusBadge status={comp.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-line py-3">
                      {symbol && ticker ? (
                        <>
                          <span className="num text-[17px] font-semibold text-ink">
                            {formatPrice(ticker.price)}
                          </span>
                          <ChangeTag value={ticker.changePct} size="sm" caret={false} />
                        </>
                      ) : (
                        <span className="skeleton h-5 w-28" />
                      )}
                      <span className="num ml-auto text-[12px] text-ink-3">
                        Starts {comp.startTime} · {comp.duration}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <dl className="flex gap-6">
                        <div>
                          <dt className="label">Pool</dt>
                          <dd className="num mt-1.5 text-[13px] text-ink">
                            {formatNumber(comp.prize)} USDT
                          </dd>
                        </div>
                        <div>
                          <dt className="label">Entry</dt>
                          <dd className="num mt-1.5 text-[13px] text-ink-2">
                            {formatNumber(comp.entry)} USDT
                          </dd>
                        </div>
                        <div>
                          <dt className="label">Seats</dt>
                          <dd className="num mt-1.5 text-[13px] text-ink-2">
                            {formatNumber(comp.players)} / {formatNumber(comp.maxPlayers)}
                          </dd>
                        </div>
                      </dl>
                      <Link href={href} className="btn btn-primary px-3.5 py-2">
                        {comp.status === 'live' ? 'Open terminal' : 'Enter round'}
                        <ArrowUpRight size={12} aria-hidden />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink">Wallet activity</h2>
            <div className="panel mt-5 divide-y divide-line">
              {TRANSACTIONS.slice(0, 6).map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-4 px-4 py-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-control border"
                    style={{
                      borderColor: transaction.positive
                        ? 'rgba(52, 211, 153, 0.3)'
                        : 'rgba(248, 113, 113, 0.3)',
                      color: transaction.positive ? 'var(--color-long)' : 'var(--color-short)',
                    }}
                  >
                    {transaction.positive ? (
                      <DownloadSimple size={13} aria-hidden />
                    ) : (
                      <UploadSimple size={13} aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink">{transaction.label}</span>
                    <span className="block text-[11.5px] text-ink-3">{transaction.time}</span>
                  </span>
                  <span
                    className="num text-[13px]"
                    style={{
                      color: transaction.positive ? 'var(--color-long)' : 'var(--color-short)',
                    }}
                  >
                    {transaction.positive ? '+' : ''}
                    {formatNumber(transaction.amount)} USDT
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <Link
                  href={ROUTES.wallet}
                  className="flex items-center gap-1.5 text-[12.5px] text-accent hover:underline"
                >
                  Full history
                  <ArrowRight size={12} aria-hidden />
                </Link>
                <span className="num text-[11px] text-ink-3">
                  Updated {formatRelative(Date.now() - 120000)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-card border border-line bg-surface p-5">
              <Trophy size={17} className="text-accent" aria-hidden />
              <p className="mt-3 text-[13.5px] font-semibold text-ink">
                Balance and prizes are simulated
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">
                This prototype keeps a local account balance for demonstration. Market prices,
                volumes and indicators on this page are live Binance data.
              </p>
              <p className="num mt-3 text-[11.5px] text-ink-3">
                Spread across the watchlist:{' '}
                {formatCompact(watchlist.reduce((sum, ticker) => sum + ticker.quoteVolume, 0))} USDT
                traded
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
