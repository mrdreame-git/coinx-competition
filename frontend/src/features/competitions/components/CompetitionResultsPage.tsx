'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Coins, DownloadSimple, Info } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { COMPETITIONS, PRIZE_TIERS } from '@/mocks/competitions'
import { LEADERBOARD_DATA, PODIUM_RESULTS } from '@/mocks/leaderboard'
import { formatNumber } from '@/lib/format'
import Header from '@/components/layout/Header'
import LeaderboardTable, { PodiumCard } from '@/components/common/LeaderboardTable'

const ACCOUNT = { finalRank: 7, returnPct: 8.42, prize: 200, entry: 100 }

export default function CompetitionResultsPage() {
  const params = useParams<{ competitionId: string }>()
  const competitionId = Number(params?.competitionId ?? 1)
  const comp = COMPETITIONS.find((item) => item.id === competitionId) ?? COMPETITIONS[0]

  const pool = comp.prize
  const paidPlaces = PRIZE_TIERS.length
  const netResult = ACCOUNT.prize - ACCOUNT.entry

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

        <header className="mt-5 border-b border-line pb-6">
          <p className="label">Round settled</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {comp.name}
          </h1>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-ink-2">
            {comp.pair} over a {comp.duration} window. {formatNumber(pool)} USDT was distributed
            across the top {paidPlaces} places, ranked on percent return.
          </p>
        </header>

        {/* Podium */}
        <section className="mt-8">
          <h2 className="text-[15px] font-semibold text-ink">Standings</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {PODIUM_RESULTS.map((entry) => (
              <PodiumCard
                key={entry.rank}
                rank={entry.rank}
                name={entry.name}
                returnPct={Number.parseFloat(entry.returnPct.replace(/[^0-9.-]/g, ''))}
                prize={Number.parseFloat(entry.prize.replace(/[^0-9.]/g, ''))}
              />
            ))}
          </div>
        </section>

        {/* Your result */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div
            className="rounded-card border p-6"
            style={{
              borderColor: 'rgba(95, 168, 255, 0.3)',
              backgroundColor: 'rgba(95, 168, 255, 0.06)',
            }}
          >
            <p className="label">Your result</p>
            <div className="mt-4 flex flex-wrap items-baseline gap-6">
              <div>
                <p className="num text-[42px] leading-none font-semibold tracking-tight text-ink">
                  #{ACCOUNT.finalRank}
                </p>
                <p className="mt-2 text-[12px] text-ink-3">
                  of {formatNumber(comp.players)} entrants
                </p>
              </div>
              <div>
                <p className="num text-[22px] leading-none font-semibold text-long">
                  +{ACCOUNT.returnPct.toFixed(2)}%
                </p>
                <p className="mt-2 text-[12px] text-ink-3">Percent return</p>
              </div>
              <div>
                <p className="num text-[22px] leading-none font-semibold text-warn">
                  {formatNumber(ACCOUNT.prize)} USDT
                </p>
                <p className="mt-2 text-[12px] text-ink-3">Prize credited</p>
              </div>
            </div>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5">
              {[
                ['Entry fee', `-${ACCOUNT.entry} USDT`],
                ['Prize', `+${ACCOUNT.prize} USDT`],
                ['Net for the round', `${netResult >= 0 ? '+' : ''}${netResult} USDT`],
                ['Pool share', `${((ACCOUNT.prize / pool) * 100).toFixed(2)}%`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11.5px] text-ink-3">{label}</dt>
                  <dd className="num mt-1.5 text-[13px] text-ink-2">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ROUTES.wallet} className="btn btn-secondary px-4 py-2.5">
                <DownloadSimple size={13} aria-hidden />
                Withdraw from wallet
              </Link>
              <Link href={ROUTES.competitions} className="btn btn-primary px-4 py-2.5">
                Enter the next round
                <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <Coins size={15} className="text-accent" aria-hidden />
              <h2 className="text-[15px] font-semibold text-ink">Payout tiers</h2>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              {PRIZE_TIERS.slice(0, 6).map((tier) => {
                const isYours = String(tier.rank) === String(ACCOUNT.finalRank)
                return (
                  <div
                    key={tier.rank}
                    className="flex items-center justify-between gap-4 rounded-control px-3 py-2"
                    style={{
                      backgroundColor: isYours ? 'rgba(95, 168, 255, 0.1)' : undefined,
                    }}
                  >
                    <span
                      className="num text-[12.5px]"
                      style={{ color: isYours ? 'var(--color-accent)' : 'var(--color-ink-2)' }}
                    >
                      #{tier.rank}
                    </span>
                    <span className="num text-[12.5px] text-ink">
                      {formatNumber(tier.prize)} USDT
                    </span>
                    <span className="num text-[11px] text-ink-3">{tier.pct}</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 border-t border-line pt-4 text-[11.5px] leading-relaxed text-ink-3">
              Tiers beyond these paid the same schedule scaled to the remaining pool.
            </p>
          </div>
        </section>

        {/* Full board */}
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[15px] font-semibold text-ink">Full leaderboard</h2>
            <Link href={ROUTES.leaderboard} className="btn btn-ghost px-3 py-2 text-[12px]">
              Live board
              <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
          <div className="panel mt-4 overflow-hidden">
            <LeaderboardTable data={LEADERBOARD_DATA} />
          </div>
        </section>

        <div className="mt-6 flex items-start gap-2.5 rounded-card border border-line bg-surface p-4">
          <Info size={13} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
          <p className="text-[11.5px] leading-relaxed text-ink-2">
            Returns and prizes on this page close out a round held on simulated competition capital
            settled against live Binance prices.
          </p>
        </div>
      </main>
    </div>
  )
}
