'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
import { COMPETITIONS } from '@/mocks/competitions'
import { useLiveTickers } from '@/lib/binance/hooks'
import { ROUTES } from '@/config/app'
import CompetitionCard from '@/features/competitions/components/CompetitionCard'

/** "BTC / ETH / SOL" resolves to BTC, which is the leg the price panel quotes. */
function baseOf(pair: string): string {
  return pair.split('/')[0]?.trim().toUpperCase() ?? ''
}

/**
 * One subscription feeds every card, then each card is handed only the ticker it
 * needs. Without this the cards would each open their own socket.
 */
export default function LiveCompetitions() {
  const { byBase, error, loading } = useLiveTickers()

  const open = COMPETITIONS.filter((comp) => comp.status !== 'finished')
  const featured = open.find((comp) => comp.status === 'live') ?? open[0]
  const rest = open.filter((comp) => comp.id !== featured?.id)

  if (loading && !error) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="panel h-[420px] animate-pulse" />
        <div className="grid gap-5">
          <div className="panel h-[200px] animate-pulse" />
          <div className="panel h-[200px] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      {featured && (
        <CompetitionCard comp={featured} ticker={byBase.get(baseOf(featured.pair))} featured />
      )}

      <div className="grid gap-5">
        {rest.slice(0, 2).map((comp) => (
          <CompetitionCard key={comp.id} comp={comp} ticker={byBase.get(baseOf(comp.pair))} />
        ))}
      </div>

      <div className="lg:col-span-2">
        <Link href={ROUTES.competitions} className="btn btn-secondary px-4 py-2.5">
          Browse every round
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
