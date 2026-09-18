'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChartBar, Pulse, TrendDown, TrendUp } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { COMPETITIONS } from '@/mocks/competitions'
import { LEADERBOARD_DATA } from '@/mocks/leaderboard'
import { MARKET_SYMBOLS } from '@/lib/binance/symbols'
import { useLiveTickers } from '@/lib/binance/hooks'
import { formatNumber, formatPct, formatPrice, formatUsd } from '@/lib/format'
import Header from '@/components/layout/Header'
import LeaderboardTable, { PodiumCard } from '@/components/common/LeaderboardTable'
import ChangeTag from '@/components/common/ChangeTag'
import { ErrorState, Skeleton } from '@/components/common/StatePanel'

/** Positioning shares are competition aggregates, not live exchange data. */
const POSITIONING = [
  { base: 'BTC', longPct: 72 },
  { base: 'ETH', longPct: 58 },
  { base: 'SOL', longPct: 41 },
  { base: 'BNB', longPct: 68 },
]

const TRADE_LOG = [
  { time: '16:42', trader: 'CryptoKing', action: 'Buy', base: 'BTC' },
  { time: '16:41', trader: 'Alpha_X', action: 'Sell', base: 'ETH' },
  { time: '16:40', trader: 'You', action: 'Buy', base: 'BTC' },
  { time: '16:39', trader: 'BullRunner', action: 'Buy', base: 'SOL' },
  { time: '16:38', trader: 'SatoshiV', action: 'Sell', base: 'BTC' },
  { time: '16:37', trader: 'NightOwl', action: 'Buy', base: 'ETH' },
  { time: '16:36', trader: 'MoonShot', action: 'Sell', base: 'SOL' },
  { time: '16:35', trader: 'DigitalApe', action: 'Buy', base: 'BTC' },
]

export default function LeaderboardPage() {
  const { tickers, loading, error, status, refresh } = useLiveTickers()
  const [competitionId, setCompetitionId] = useState(COMPETITIONS[0].id)
  const comp = COMPETITIONS.find((item) => item.id === competitionId) ?? COMPETITIONS[0]

  const podium = LEADERBOARD_DATA.slice(0, 3)
  const you = LEADERBOARD_DATA.find((row) => row.isUser)

  const aggregate = useMemo(() => {
    const totalReturn = LEADERBOARD_DATA.reduce((sum, row) => sum + row.returnPct, 0)
    const positive = LEADERBOARD_DATA.filter((row) => row.returnPct > 0).length
    return {
      average: totalReturn / LEADERBOARD_DATA.length,
      positive,
      total: LEADERBOARD_DATA.length,
    }
  }, [])

  const marketTiles = useMemo(
    () =>
      MARKET_SYMBOLS.slice(0, 6).flatMap((meta) => {
        const ticker = tickers.find((item) => item.base === meta.base)
        return ticker ? [ticker] : []
      }),
    [tickers],
  )

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="flex items-center gap-2">
              {status === 'open' && <span className="live-pip" aria-hidden />}
              <span
                className="label"
                style={{ color: error ? 'var(--color-short)' : undefined }}
              >
                {error
                  ? 'Market feed offline'
                  : status === 'open'
                    ? 'Priced on every fill'
                    : 'Connecting to the feed'}
              </span>
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-ink-2">
              Ranked on percent return on the round balance, counting realised and unrealised
              profit. Ties break on trade count, then on the entry timestamp.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="label" htmlFor="round-select">
              Round
            </label>
            <select
              id="round-select"
              value={competitionId}
              onChange={(event) => setCompetitionId(Number(event.target.value))}
              className="field mt-2"
            >
              {COMPETITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Round summary strip */}
        <dl className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Prize pool', `${formatNumber(comp.prize)} USDT`],
            ['Entrants', formatNumber(comp.players)],
            ['Average return', formatPct(aggregate.average, 2)],
            ['Trading higher', `${aggregate.positive} of ${aggregate.total}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface px-5 py-4">
              <dt className="label">{label}</dt>
              <dd className="num mt-2.5 text-[18px] font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="text-[15px] font-semibold text-ink">Top of the board</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {podium.map((row) => (
                  <PodiumCard
                    key={row.rank}
                    rank={row.rank}
                    name={row.name}
                    returnPct={row.returnPct}
                    prize={row.prize}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-[15px] font-semibold text-ink">
                  Full board · {formatNumber(LEADERBOARD_DATA.length)} traders
                </h2>
                {you && (
                  <span className="num text-[12px] text-ink-3">
                    You are ranked #{you.rank} on {formatPct(you.returnPct, 2)}
                  </span>
                )}
              </div>
              <div className="panel mt-4 overflow-hidden">
                <LeaderboardTable data={LEADERBOARD_DATA} />
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            {/* Aggregate positioning */}
            <section className="panel p-5">
              <div className="flex items-center gap-2">
                <ChartBar size={14} className="text-accent" aria-hidden />
                <h2 className="text-[14px] font-semibold text-ink">Where the field sits</h2>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                Share of open positions held long, per contract, across all entrants in this round.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {POSITIONING.map((row) => (
                  <div key={row.base} className="flex items-center gap-3">
                    <span className="num w-10 text-[12px] text-ink-2">{row.base}</span>
                    <div className="flex flex-1 items-center gap-1">
                      <span className="num w-9 text-right text-[11px] text-long">
                        {row.longPct}%
                      </span>
                      {/* Trackless split: two adjacent fills, no rail behind them. */}
                      <span className="flex h-[6px] flex-1 overflow-hidden rounded-pill">
                        <span
                          className="h-full"
                          style={{
                            width: `${row.longPct}%`,
                            backgroundColor: 'rgba(52, 211, 153, 0.7)',
                          }}
                        />
                        <span
                          className="h-full flex-1"
                          style={{ backgroundColor: 'rgba(248, 113, 113, 0.7)' }}
                        />
                      </span>
                      <span className="num w-9 text-[11px] text-short">
                        {100 - row.longPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <dl className="mt-5 flex gap-6 border-t border-line pt-4">
                <div>
                  <dt className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
                    <TrendUp size={12} className="text-long" aria-hidden />
                    Net long
                  </dt>
                  <dd className="num mt-1.5 text-[14px] text-ink">64%</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
                    <TrendDown size={12} className="text-short" aria-hidden />
                    Net short
                  </dt>
                  <dd className="num mt-1.5 text-[14px] text-ink">36%</dd>
                </div>
              </dl>
            </section>

            {/* Trade log */}
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  <Pulse size={14} className="text-accent" aria-hidden />
                  Recent fills
                </span>
                <span className="num text-[11.5px] text-ink-3">{TRADE_LOG.length}</span>
              </div>
              <ul>
                {TRADE_LOG.map((entry, index) => (
                  <li
                    key={`${entry.time}-${index}`}
                    className="flex items-center gap-3 border-b border-line px-5 py-2.5 last:border-b-0"
                  >
                    <span className="num w-11 text-[11.5px] text-ink-3">{entry.time}</span>
                    <span
                      className="flex-1 truncate text-[12.5px]"
                      style={{
                        color: entry.trader === 'You' ? 'var(--color-accent)' : 'var(--color-ink-2)',
                      }}
                    >
                      {entry.trader}
                    </span>
                    <span
                      className="num text-[11.5px]"
                      style={{
                        color: entry.action === 'Buy' ? 'var(--color-long)' : 'var(--color-short)',
                      }}
                    >
                      {entry.action} {entry.base}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-5 py-3 text-[11.5px] text-ink-3">
                A sample of fills from this round. The full tape lives in the trading terminal.
              </p>
            </section>

            {/* Live market tiles */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-ink">Markets in play</h2>
                <Link
                  href={ROUTES.markets}
                  className="flex items-center gap-1 text-[12px] text-accent hover:underline"
                >
                  All markets
                  <ArrowRight size={11} aria-hidden />
                </Link>
              </div>
              {error && marketTiles.length === 0 ? (
                <div className="panel mt-4">
                  <ErrorState
                    title="Markets in play need the price feed"
                    message={error}
                    onRetry={refresh}
                  />
                </div>
              ) : loading && marketTiles.length === 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-surface px-4 py-3.5">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="mt-2.5 h-3 w-20" />
                      <Skeleton className="mt-2.5 h-2.5 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line">
                  {marketTiles.map((ticker) => (
                    <Link
                      key={ticker.symbol}
                      href={ROUTES.marketDetail(ticker.base)}
                      className="bg-surface px-4 py-3.5 transition-colors hover:bg-surface-2"
                    >
                      <p className="text-[12.5px] font-semibold text-ink">{ticker.base}</p>
                      <p className="num mt-1.5 text-[13px] text-ink-2">
                        {formatPrice(ticker.price)}
                      </p>
                      <span className="mt-1.5 flex items-center justify-between">
                        <ChangeTag value={ticker.changePct} size="sm" caret={false} />
                        <span className="num text-[10.5px] text-ink-3">
                          {formatUsd(ticker.quoteVolume, 1)}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
