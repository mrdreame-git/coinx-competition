'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Info, SignIn, UsersThree } from '@phosphor-icons/react'
import { ROUTES } from '@/config/app'
import { COMPETITIONS } from '@/mocks/competitions'
import { LOBBY_TRADERS } from '@/mocks/leaderboard'
import { findSymbol } from '@/lib/binance/symbols'
import { useLiveTicker } from '@/lib/binance/hooks'
import { formatClock, formatNumber, formatPrice } from '@/lib/format'
import Header from '@/components/layout/Header'
import { useCountdown } from '@/hooks/use-countdown'
import ChangeTag from '@/components/common/ChangeTag'

const ORDER_TYPES = [
  ['Orders', 'Market and limit, both accepted from the opening bell'],
  ['Size', 'Up to 25% of the round balance in a single position'],
  ['Take profit', 'Set before entry or adjust while the position is open'],
  ['Close', 'Positions close automatically when the window ends'],
]

export default function CompetitionLobbyPage() {
  const params = useParams<{ competitionId: string }>()
  const router = useRouter()
  const competitionId = Number(params?.competitionId ?? 1)
  const comp = COMPETITIONS.find((item) => item.id === competitionId) ?? COMPETITIONS[0]

  const base = comp.pair.split('/')[0]?.trim().toUpperCase() ?? 'BTC'
  const market = findSymbol(base)
  const { ticker } = useLiveTicker(market?.base ?? 'BTC')

  // Two minutes of lobby time before the round opens.
  const { formatted: timer, isFinished } = useCountdown({
    durationSeconds: 134,
    onComplete: () => router.push(ROUTES.liveComp(comp.id)),
  })

  return (
    <div className="min-h-[100dvh] bg-void">
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 py-8 lg:px-6">
        <Link
          href={ROUTES.competitionDetail(comp.id)}
          className="flex items-center gap-1.5 text-[12.5px] text-ink-3 transition-colors hover:text-accent"
        >
          <ArrowLeft size={12} aria-hidden />
          Round details
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div className="flex flex-col gap-6">
            <div className="panel p-6">
              <p className="label">Waiting room</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{comp.name}</h1>
              <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">
                Trading unlocks automatically when the timer reaches zero. The terminal loads on
                its own, so keep this tab open and have your plan ready.
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-line pt-6">
                <div>
                  <p className="label">Opens in</p>
                  <p
                    className="num mt-2 text-[42px] leading-none font-semibold tracking-tight text-ink"
                    aria-live="polite"
                  >
                    {timer}
                  </p>
                </div>
                <div className="ml-auto flex flex-col gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="num text-[13px] text-ink-3">{comp.pair}</span>
                    {ticker ? (
                      <>
                        <span className="num text-[16px] font-semibold text-ink">
                          {formatPrice(ticker.price)}
                        </span>
                        <ChangeTag value={ticker.changePct} size="sm" caret={false} />
                      </>
                    ) : (
                      <span className="skeleton h-4 w-24" />
                    )}
                  </div>
                  <Link
                    href={ROUTES.liveComp(comp.id)}
                    className="btn btn-primary px-4 py-2.5"
                  >
                    {isFinished ? 'Round is open' : 'Open the terminal early'}
                    <ArrowRight size={13} aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <h2 className="text-[15px] font-semibold text-ink">What you can place</h2>
              <dl className="mt-4 flex flex-col">
                {ORDER_TYPES.map(([label, value]) => (
                  <div key={label} className="border-b border-line py-3 last:border-b-0">
                    <dt className="text-[12.5px] text-ink-3">{label}</dt>
                    <dd className="mt-1 text-[13px] leading-relaxed text-ink-2">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line">
              {[
                ['Registered', `${formatNumber(comp.players)}`],
                ['Seats', `${formatNumber(comp.maxPlayers)}`],
                ['Prize pool', `${formatNumber(comp.prize)} USDT`],
                ['Starting capital', `${comp.entry} USDT`],
                ['Window', comp.duration],
                ['Start time', comp.startTime],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-4 py-3.5">
                  <dt className="label">{label}</dt>
                  <dd className="num mt-2 text-[14px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-ink-2">
                  <UsersThree size={14} aria-hidden />
                  Registered traders
                </span>
                <span className="num text-[11.5px] text-ink-3">
                  {formatNumber(comp.players)}
                </span>
              </div>

              <ul>
                {LOBBY_TRADERS.map((name, index) => {
                  const isYou = name === 'YOU'
                  return (
                    <li
                      key={name}
                      className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                      style={{
                        backgroundColor: isYou ? 'rgba(95, 168, 255, 0.07)' : undefined,
                      }}
                    >
                      <span className="num w-6 text-[11.5px] text-ink-3">{index + 1}</span>
                      <span
                        className="flex-1 truncate text-[13px]"
                        style={{
                          color: isYou ? 'var(--color-accent)' : 'var(--color-ink)',
                          fontWeight: isYou ? 600 : 400,
                        }}
                      >
                        {name}
                      </span>
                      <span className="num text-[11px] text-ink-3">
                        Ready
                      </span>
                    </li>
                  )
                })}
              </ul>

              <p className="border-t border-line px-4 py-3 text-[11.5px] text-ink-3">
                Showing the first 7 of {formatNumber(comp.players)} entrants. The full field appears
                on the leaderboard once the round starts.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface p-4">
              <Info size={13} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
              <p className="text-[11.5px] leading-relaxed text-ink-2">
                Closing this tab does not withdraw you from the round. Registered entries are
                charged at {comp.startTime} and the fee is reserved until the round settles.
              </p>
            </div>
          </div>
        </div>

        {isFinished && (
          <p className="mt-6 flex items-center gap-2 text-[12.5px] text-accent">
            <SignIn size={13} aria-hidden />
            The round is open. Redirecting to the terminal if you have not moved already.
          </p>
        )}
      </main>
    </div>
  )
}
