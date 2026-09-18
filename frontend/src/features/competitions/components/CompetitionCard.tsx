'use client'

import Link from 'next/link'
import { ArrowRight, Clock, UsersThree } from '@phosphor-icons/react'
import type { Competition } from '@/types/competition'
import type { Ticker24h } from '@/lib/binance/types'
import { ROUTES } from '@/config/app'
import { formatNumber, formatPrice } from '@/lib/format'
import StatusBadge from '@/components/common/StatusBadge'
import ChangeTag from '@/components/common/ChangeTag'

interface CompetitionCardProps {
  comp: Competition
  /** Live stats for the competition's pair, injected by the parent so one
   *  subscription serves every card on the page. */
  ticker?: Ticker24h
  featured?: boolean
}

export default function CompetitionCard({ comp, ticker, featured = false }: CompetitionCardProps) {
  const seatsFilled = Math.min(comp.players / comp.maxPlayers, 1)
  const seatPct = Math.round(seatsFilled * 100)

  return (
    <article
      className={`panel group flex flex-col transition-colors hover:border-line-strong ${featured ? 'p-6' : 'p-5'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="num text-[11px] text-ink-3">{comp.pair}</p>
          <h3
            className={`mt-1.5 font-semibold tracking-tight text-ink ${featured ? 'text-xl' : 'text-base'}`}
          >
            {comp.name}
          </h3>
        </div>
        <StatusBadge status={comp.status} />
      </div>

      {/* Live pair price from Binance, so the card shows the market it trades. */}
      <div className="mt-4 flex items-baseline gap-3 border-y border-line py-3">
        {ticker ? (
          <>
            <span className="num text-[19px] font-semibold text-ink">
              {formatPrice(ticker.price)}
            </span>
            <ChangeTag value={ticker.changePct} size="sm" caret={false} />
            <span className="label ml-auto">24h</span>
          </>
        ) : (
          <span className="skeleton h-5 w-32" />
        )}
      </div>

      <dl className={`mt-4 grid gap-4 ${featured ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div>
          <dt className="label">Prize pool</dt>
          <dd className="num mt-1.5 text-[15px] font-semibold text-ink">
            ${formatNumber(comp.prize)}
          </dd>
        </div>
        <div>
          <dt className="label">Entry</dt>
          <dd className="num mt-1.5 text-[15px] text-ink-2">${formatNumber(comp.entry)}</dd>
        </div>
        {featured && (
          <div>
            <dt className="label">Window</dt>
            <dd className="num mt-1.5 text-[15px] text-ink-2">{comp.duration}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
            <UsersThree size={12} aria-hidden />
            <span className="num">
              {formatNumber(comp.players)} of {formatNumber(comp.maxPlayers)} seats
            </span>
          </span>
          <span className="num text-[11.5px] text-ink-3">{seatPct}%</span>
        </div>
        {/* Trackless fill: a single bar, no background rail (skill.md 9.F). */}
        <div className="mt-2 h-[3px] w-full overflow-hidden rounded-pill bg-surface-3">
          <div
            className="h-full rounded-pill"
            style={{
              width: `${seatPct}%`,
              backgroundColor: seatPct >= 90 ? 'var(--color-warn)' : 'var(--color-accent)',
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
        <span className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
          <Clock size={12} aria-hidden />
          {comp.status === 'live'
            ? 'Running now'
            : comp.status === 'finished'
              ? 'Settled'
              : `Starts at ${comp.startTime}`}
        </span>
        <Link
          href={ROUTES.competitionDetail(comp.id)}
          className="btn btn-ghost px-3 py-2 text-[11.5px] group-hover:border-accent group-hover:text-accent"
        >
          View round
          <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
    </article>
  )
}
