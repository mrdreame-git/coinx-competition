'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Info,
  Scales,
  Timer,
  UsersThree,
} from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import {
  COMPETITIONS,
  COMPETITION_RULES,
  PRIZE_TIERS,
} from '@/mocks/competitions'
import { findSymbol } from '@/lib/binance/symbols'
import { useKlines, useLiveTicker } from '@/lib/binance/hooks'
import { formatNumber, formatPrice } from '@/lib/format'
import Header from '@/components/layout/Header'
import CandlestickChart from '@/components/common/CandlestickChart'
import ChangeTag from '@/components/common/ChangeTag'
import StatusBadge from '@/components/common/StatusBadge'
import { InlineSpinner } from '@/components/common/StatePanel'

const ACCOUNT_BALANCE = 1250

export default function CompetitionDetailPage() {
  const params = useParams<{ competitionId: string }>()
  const router = useRouter()
  const competitionId = Number(params?.competitionId ?? 1)
  const comp = COMPETITIONS.find((item) => item.id === competitionId) ?? COMPETITIONS[0]

  const base = comp.pair.split('/')[0]?.trim().toUpperCase() ?? 'BTC'
  const market = findSymbol(base)
  const { ticker } = useLiveTicker(market?.base ?? 'BTC')
  const { candles } = useKlines(market?.base ?? 'BTC', '15m', 96)

  const [modalOpen, setModalOpen] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  const seatsLeft = Math.max(comp.maxPlayers - comp.players, 0)
  const seatPct = Math.round((comp.players / comp.maxPlayers) * 100)
  const balanceAfter = ACCOUNT_BALANCE - comp.entry
  const canAfford = balanceAfter >= 0
  const prizeTotal = PRIZE_TIERS.reduce((sum, tier) => sum + tier.prize, 0)
  const settled = comp.status === 'finished'

  const confirmJoin = async () => {
    setJoining(true)
    // Stands in for the join request until the account service exists.
    await new Promise((resolve) => setTimeout(resolve, 700))
    setJoining(false)
    setModalOpen(false)
    setJoined(true)
  }

  if (joined) {
    return (
      <div className="min-h-[100dvh] bg-void">
        <Header />
        <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
          <span
            className="flex size-12 items-center justify-center rounded-control border"
            style={{
              borderColor: 'rgba(52, 211, 153, 0.4)',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
            }}
          >
            <CheckCircle size={22} className="text-long" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
            You are registered
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
            {comp.entry} USDT has been reserved from your wallet for {comp.name}. The lobby opens
            ahead of the start time, and trading unlocks when the timer ends.
          </p>

          <dl className="mt-8 grid w-full grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line text-left">
            <div className="bg-surface px-4 py-3.5">
              <dt className="label">Round starts</dt>
              <dd className="num mt-2 text-[14px] text-ink">{comp.startTime}</dd>
            </div>
            <div className="bg-surface px-4 py-3.5">
              <dt className="label">Window</dt>
              <dd className="num mt-2 text-[14px] text-ink">{comp.duration}</dd>
            </div>
            <div className="bg-surface px-4 py-3.5">
              <dt className="label">Reserved</dt>
              <dd className="num mt-2 text-[14px] text-ink">{comp.entry} USDT</dd>
            </div>
            <div className="bg-surface px-4 py-3.5">
              <dt className="label">Balance left</dt>
              <dd className="num mt-2 text-[14px] text-ink-2">{balanceAfter} USDT</dd>
            </div>
          </dl>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push(ROUTES.compLobby(comp.id))}
              className="btn btn-primary flex-1 py-3"
            >
              Open the lobby
              <ArrowRight size={13} aria-hidden />
            </button>
            <Link href={ROUTES.competitions} className="btn btn-ghost flex-1 py-3">
              Browse other rounds
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6">
        <Link
          href={ROUTES.competitions}
          className="flex items-center gap-1.5 text-[12.5px] text-ink-3 transition-colors hover:text-accent"
        >
          <ArrowLeft size={12} aria-hidden />
          All competitions
        </Link>

        <header className="mt-5 flex flex-wrap items-start justify-between gap-5 border-b border-line pb-6">
          <div>
            <p className="num text-[11.5px] text-ink-3">{comp.pair}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              {comp.name}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-ink-2">
              A {comp.duration} round on {comp.pair}. Everyone enters with the same starting
              balance, trading opens at {comp.startTime}, and the board settles on percent return.
            </p>
          </div>
          <StatusBadge status={comp.status} />
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Live market context */}
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="num text-[13px] text-ink">{comp.pair}</span>
              <div className="flex items-center gap-3">
                {ticker ? (
                  <>
                    <span className="num text-[15px] font-semibold text-ink">
                      {formatPrice(ticker.price)}
                    </span>
                    <ChangeTag value={ticker.changePct} size="sm" />
                  </>
                ) : (
                  <span className="skeleton h-4 w-28" />
                )}
              </div>
            </div>
            <div className="px-2 py-3">
              <CandlestickChart candles={candles} height={280} volume axis />
            </div>
            <p className="border-t border-line px-4 py-3 text-[11.5px] leading-relaxed text-ink-3">
              The pair this round trades, charted at 15 minute intervals over the last 24 hours.
              Data comes from the Binance futures feed.
            </p>
          </div>

          {/* Terms */}
          <div className="flex flex-col gap-6">
            <div className="panel p-5">
              <p className="label">Round terms</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-[12px] text-ink-3">Entry fee</dt>
                  <dd className="num mt-1.5 text-[15px] font-semibold text-ink">
                    {comp.entry} USDT
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">Prize pool</dt>
                  <dd className="num mt-1.5 text-[15px] font-semibold text-ink">
                    {formatNumber(comp.prize)} USDT
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">Window</dt>
                  <dd className="num mt-1.5 text-[14px] text-ink-2">{comp.duration}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">Starts at</dt>
                  <dd className="num mt-1.5 text-[14px] text-ink-2">
                    {comp.status === 'live' ? 'Running now' : comp.startTime}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-line pt-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
                    <UsersThree size={13} aria-hidden />
                    <span className="num">
                      {formatNumber(comp.players)} of {formatNumber(comp.maxPlayers)} seats
                    </span>
                  </span>
                  <span className="num text-[12.5px] text-ink-3">
                    {seatsLeft > 0 ? `${formatNumber(seatsLeft)} left` : 'Full'}
                  </span>
                </div>
                <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-pill bg-surface-3">
                  <div
                    className="h-full rounded-pill"
                    style={{
                      width: `${seatPct}%`,
                      backgroundColor: seatPct >= 90 ? 'var(--color-warn)' : 'var(--color-accent)',
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                disabled={settled || seatsLeft === 0}
                className="btn btn-primary mt-6 w-full py-3"
              >
                {settled
                  ? 'Round settled'
                  : seatsLeft === 0
                    ? 'No seats left'
                    : `Enter for ${comp.entry} USDT`}
              </button>
              {settled && (
                <Link
                  href={ROUTES.results(comp.id)}
                  className="btn btn-ghost mt-3 w-full py-3"
                >
                  View final results
                </Link>
              )}
            </div>

            <div className="rounded-card border border-line bg-surface p-5">
              <Scales size={17} className="text-accent" aria-hidden />
              <p className="mt-3 text-[13.5px] font-semibold text-ink">
                Balance at entry is irrelevant here
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">
                The entry fee buys a seat, not an advantage. Every entrant trades the same simulated
                balance on the same pair for the same window.
              </p>
            </div>
          </div>
        </div>

        {/* Rules and prize distribution */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <Timer size={15} className="text-accent" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Round rules</h2>
            </div>
            <dl className="mt-4 flex flex-col">
              {COMPETITION_RULES.map((rule) => (
                <div
                  key={rule.label}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-b-0"
                >
                  <dt className="text-[12.5px] text-ink-3">{rule.label}</dt>
                  <dd className="num text-right text-[12.5px] text-ink">{rule.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <h2 className="text-[15px] font-semibold text-ink">Prize distribution</h2>
            <div className="mt-4 flex flex-col gap-1.5">
              {PRIZE_TIERS.map((tier, index) => {
                const share = prizeTotal ? (tier.prize / prizeTotal) * 100 : 0
                return (
                  <div
                    key={tier.rank}
                    className="flex items-center gap-4 rounded-control border border-line px-3.5 py-2.5"
                    style={{
                      borderColor:
                        index === 0
                          ? 'rgba(251, 191, 36, 0.3)'
                          : index === 1
                            ? 'rgba(155, 164, 178, 0.22)'
                            : index === 2
                              ? 'rgba(192, 132, 87, 0.28)'
                              : undefined,
                    }}
                  >
                    <span
                      className="num w-14 text-[12.5px] font-semibold"
                      style={{
                        color:
                          index === 0
                            ? 'var(--color-warn)'
                            : index === 1
                              ? 'var(--color-ink-2)'
                              : index === 2
                                ? '#c08457'
                                : 'var(--color-ink-3)',
                      }}
                    >
                      #{tier.rank}
                    </span>
                    <span className="num flex-1 text-[13px] text-ink">
                      {formatNumber(tier.prize)} USDT
                    </span>
                    <span className="num text-[11.5px] text-ink-3">{tier.pct}</span>
                    <span className="num w-14 text-right text-[11.5px] text-ink-3">
                      {share.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 border-t border-line pt-4 text-[11.5px] leading-relaxed text-ink-3">
              Tiers pay out of the {formatNumber(comp.prize)} USDT pool. Rank outside the twentieth
              place earns no payout.
            </p>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Confirm entry to ${comp.name}`}
        >
          <div className="panel-glass w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-ink">Enter {comp.name}</h2>
            <p className="mt-1.5 text-[12.5px] text-ink-3">
              {comp.pair} · {comp.duration} · starts {comp.startTime}
            </p>

            <div className="mt-4 flex items-start gap-2.5 rounded-control border border-line bg-surface-2/60 px-3.5 py-3">
              <Info size={13} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
              <p className="text-[11.5px] leading-relaxed text-ink-2">
                The entry fee is reserved when the round starts, not when you register. You can
                withdraw from the round until then.
              </p>
            </div>

            <dl className="mt-5 flex flex-col gap-2.5 border-y border-line py-4">
              {[
                ['Entry fee', `${comp.entry} USDT`],
                ['Current balance', `${formatNumber(ACCOUNT_BALANCE, 2)} USDT`],
                ['Balance after', `${formatNumber(balanceAfter, 2)} USDT`],
                ['Starting capital', `${comp.entry} USDT`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-[12.5px] text-ink-3">{label}</dt>
                  <dd
                    className="num text-[12.5px]"
                    style={{
                      color:
                        label === 'Balance after'
                          ? canAfford
                            ? 'var(--color-ink)'
                            : 'var(--color-short)'
                          : 'var(--color-ink)',
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {!canAfford && (
              <p className="mt-4 text-[12px] text-short">
                Your balance does not cover the entry fee. Deposit first, then enter the round.
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmJoin}
                disabled={!canAfford || joining}
                className="btn btn-primary flex-1 py-2.5"
              >
                {joining ? <InlineSpinner label="Reserving" /> : 'Confirm entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
