import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Broadcast,
  ChartLineUp,
  Crosshair,
  Lock,
  Scales,
  ShieldCheck,
  Timer,
  Trophy,
  Wallet,
} from '@phosphor-icons/react/dist/ssr'
import { ROUTES } from '@/config/app'
import { COMPETITIONS } from '@/mocks/competitions'
import { LEADERBOARD_DATA } from '@/mocks/leaderboard'
import MarketingNav from '@/features/landing/components/MarketingNav'
import HeroMarketPanel from '@/features/landing/components/HeroMarketPanel'
import LiveNumbers from '@/features/landing/components/LiveNumbers'
import LiveCompetitions from '@/features/landing/components/LiveCompetitions'
import TickerTape from '@/components/common/TickerTape'
import LeaderboardTable from '@/components/common/LeaderboardTable'
import Reveal, { RevealItem, RevealList } from '@/components/common/Reveal'
import SiteFooter from '@/components/layout/SiteFooter'

/**
 * Landing page.
 *
 * Design read: consumer trading-competition landing for competitive retail
 * traders, dark terminal language, Tailwind v4 + Phosphor + Motion on a
 * Geist / Geist Mono stack. Dials 7 / 6 / 4.
 *
 * Layout families, none repeated back to back: split hero, live tape, metric row,
 * featured-plus-stack, sticky heading with steps, bento, table, disclosure list,
 * closing band. Exactly one marquee on the page (the tape). Two eyebrows total
 * across nine sections.
 */

const STEPS = [
  {
    icon: Timer,
    title: 'Enter a round',
    body: 'Pick an open round and put down the entry fee. Seats are capped, and the pool stops growing the moment the timer starts.',
  },
  {
    icon: ChartLineUp,
    title: 'Trade the window',
    body: 'Long or short the listed pair with market and limit orders. Every entry starts on the same balance, so position sizing is the only variable you control.',
  },
  {
    icon: Crosshair,
    title: 'Rank live',
    body: 'The board re-sorts on every fill. Percent return is the only ranking input, so a small account on a good read beats a large one on a bad one.',
  },
  {
    icon: Wallet,
    title: 'Settle and withdraw',
    body: 'Open positions close when the window ends and the pool pays out by tier. The prize lands in your wallet, ready to withdraw or roll into the next round.',
  },
]

const PRINCIPLES = [
  {
    icon: Scales,
    title: 'Equal starting capital',
    body: 'Deposit size never touches the scoreboard. Everyone in a round opens with the same balance and the same pair.',
  },
  {
    icon: Broadcast,
    title: 'Public pools',
    body: 'The entry fee is published before you commit, and the pool is the sum of the entries taken.',
  },
  {
    icon: Lock,
    title: 'Fixed windows',
    body: 'Rounds open and close on a published clock. No extensions and no discretionary calls mid-round.',
  },
  {
    icon: ShieldCheck,
    title: 'One fee, stated up front',
    body: 'A flat fee per fill. No spread markup, no deduction taken out of the payout tier.',
  },
]

const RULES: [string, string][] = [
  ['Ranking input', 'Percent return on the starting balance, realised plus unrealised'],
  ['Leverage ceiling', '10x on listed perpetuals, fixed before the round opens'],
  ['Order types', 'Market and limit, with optional take profit and stop loss'],
  ['Fill fee', '0.05% of notional per side'],
  ['Payout tiers', 'Top 20 places by rank, schedule published with each round'],
  ['Settlement', 'Positions closed at the closing mark, payouts credited immediately'],
]

export default function LandingPage() {
  const openRounds = COMPETITIONS.filter((comp) => comp.status !== 'finished')

  return (
    <div className="min-h-[100dvh] bg-void">
      <MarketingNav />

      {/* Hero: asymmetric split, four text elements only, no stat row or trust
          strip inside it. CTAs sit above the fold on a laptop viewport. */}
      <section className="mx-auto max-w-[1440px] px-6 pt-24 pb-16 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <p className="label">Timed crypto competitions</p>

            <h1 className="mt-5 max-w-[16ch] text-5xl leading-[1.05] font-semibold tracking-tight text-balance text-ink md:text-6xl">
              Ranked by return, not by deposit.
            </h1>

            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
              Everyone starts on the same balance. Trade live crypto futures for a fixed window;
              highest percent return takes the pool.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={ROUTES.register} className="btn btn-primary px-5 py-3">
                Create account
              </Link>
              <Link href="#competitions" className="btn btn-ghost px-5 py-3">
                See open rounds
              </Link>
            </div>
          </div>

          <Reveal y={24}>
            <HeroMarketPanel />
          </Reveal>
        </div>
      </section>

      {/* The single marquee on this page. Live prices, not decoration. */}
      <TickerTape />

      <LiveNumbers />

      {/* Featured round plus a stacked pair. Deliberately not three equal cards. */}
      <section id="competitions" className="mx-auto max-w-[1440px] scroll-mt-20 px-6 py-20">
        <div className="max-w-[62ch]">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Rounds open now
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Each round publishes its pair, window, entry fee and prize pool before entries close.
            {` ${openRounds.length} rounds are taking entrants right now.`}
          </p>
        </div>

        <div className="mt-10">
          <LiveCompetitions />
        </div>
      </section>

      {/* Sticky heading beside a step list. Asymmetric, and the steps carry verb
          labels rather than "Stage 1" numbering. */}
      <section id="ranking" className="scroll-mt-20 border-y border-line bg-surface/40 py-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="label">How ranking works</p>
            <h2 className="mt-5 max-w-[18ch] text-3xl leading-tight font-semibold tracking-tight text-ink md:text-4xl">
              Four steps, one number on the board.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
              The format is built to keep the leaderboard readable: the same starting balance, the
              same pair and the same clock, ranked on percent return.
            </p>
          </div>

          <RevealList className="flex flex-col">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <RevealItem key={step.title} className="border-t border-line py-8 last:pb-0">
                  <div className="flex items-start gap-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface-2">
                      <Icon size={17} className="text-accent" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                      <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </RevealItem>
              )
            })}
          </RevealList>
        </div>
      </section>

      {/* Bento: exactly six cells for four principles plus two photographs, and
          the spans tile the grid with no holes. */}
      <section className="mx-auto max-w-[1440px] px-6 py-20">
        <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Built so the ranking means something.
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-card border border-line lg:row-span-2">
            <Image
              src="https://picsum.photos/seed/coinx-trading-desk/800/1200?grayscale"
              alt="A trading desk at night with market depth on screen"
              width={800}
              height={1200}
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="h-full w-full object-cover"
              style={{ minHeight: 240 }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(8,9,11,0.94) 4%, rgba(8,9,11,0.12) 55%, rgba(8,9,11,0.4) 100%)',
              }}
            />
            <p className="absolute inset-x-6 bottom-6 text-[14px] leading-relaxed text-ink">
              Rounds run on live order books. The feed that prices your entry is the feed that ranks
              the board.
            </p>
          </div>

          {PRINCIPLES.slice(0, 2).map((principle) => {
            const Icon = principle.icon
            return (
              <div
                key={principle.title}
                className="rounded-card border border-line bg-surface p-6 transition-colors hover:border-line-strong"
              >
                <Icon size={19} className="text-accent" aria-hidden />
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{principle.body}</p>
              </div>
            )
          })}

          {PRINCIPLES.slice(2).map((principle) => {
            const Icon = principle.icon
            return (
              <div
                key={principle.title}
                className="rounded-card border border-line bg-surface p-6 transition-colors hover:border-line-strong"
              >
                <Icon size={19} className="text-accent" aria-hidden />
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{principle.body}</p>
              </div>
            )
          })}

          <div className="relative overflow-hidden rounded-card border border-line lg:col-span-3">
            <Image
              src="https://picsum.photos/seed/coinx-settlement-ledger/1800/560?grayscale"
              alt="A wide ledger of settled positions on a display"
              width={1800}
              height={560}
              sizes="(max-width: 1024px) 100vw, 100vw"
              className="h-full w-full object-cover"
              style={{ minHeight: 190 }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(8,9,11,0.95) 2%, rgba(8,9,11,0.6) 45%, rgba(8,9,11,0.12) 100%)',
              }}
            />
            <div className="absolute inset-y-0 left-0 flex max-w-[40ch] flex-col justify-center px-6 sm:px-8">
              <span className="mb-3 flex size-9 items-center justify-center rounded-control border border-line bg-void/70">
                <Timer size={15} className="text-accent" aria-hidden />
              </span>
              <h3 className="text-[15px] font-semibold text-ink">Settlement in one pass</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">
                When the clock stops, every open position is closed at the closing mark and payouts
                are credited by tier. Nothing is settled by hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard table beside a plain rules disclosure. Two more families. */}
      <section className="border-y border-line bg-surface/40 py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                The board as it stands
              </h2>
              <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
                A settled round ranked on percent return. The payout tier sits beside each place, so
                the gap between a good round and a great one is visible at a glance.
              </p>
            </div>
            <Link href={ROUTES.leaderboard} className="btn btn-secondary px-4 py-2.5">
              Open the live board
              <ArrowRight size={13} aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="panel overflow-hidden">
              <LeaderboardTable data={LEADERBOARD_DATA.slice(0, 8)} />
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <p className="label">Round rules</p>
                <dl className="mt-4 flex flex-col">
                  {RULES.map(([label, value]) => (
                    <div key={label} className="border-b border-line py-3 last:border-b-0">
                      <dt className="text-[12.5px] text-ink-3">{label}</dt>
                      <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-card border border-warn/25 bg-warn/6 p-5">
                <p className="text-[13px] font-semibold text-warn">Simulated balances</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                  Round capital is a simulated balance settled against live market prices. Orders
                  placed inside a round never reach a real exchange book.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing band. Reuses the single signup intent, no new CTA label. */}
      <section className="mx-auto max-w-[1440px] px-6 py-24">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Trophy size={22} className="text-accent" aria-hidden />
            <h2 className="mt-5 max-w-[20ch] text-3xl leading-tight font-semibold tracking-tight text-ink md:text-4xl">
              Your first round is three clicks away.
            </h2>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-ink-2">
              Create an account, fund the wallet, then enter a round that is already taking
              entrants. Entries close when the timer starts.
            </p>
          </div>
          <Link href={ROUTES.register} className="btn btn-primary shrink-0 px-6 py-3.5">
            Create account
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
