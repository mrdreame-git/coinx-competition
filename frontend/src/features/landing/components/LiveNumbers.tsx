'use client'

import { useExchangeStats, useLiveTickers, useMarketProfile } from '@/lib/binance/hooks'
import { formatPct, formatPrice, formatUsd } from '@/lib/format'

function Metric({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex flex-col gap-2 px-6 py-7 first:pl-0 last:pr-0 lg:px-8">
      <span className="label">{label}</span>
      <span className="num text-[26px] font-semibold leading-none tracking-tight text-ink">
        {value}
      </span>
      <span className="text-[11.5px] leading-relaxed text-ink-3">{note}</span>
    </div>
  )
}

/**
 * Live aggregates across the COINX universe. Every figure is fetched from the
 * Binance futures API, and the note under each says what it covers, so none of
 * these read as invented marketing numbers (skill.md 4.9).
 */
export default function LiveNumbers() {
  const { stats } = useExchangeStats()
  const { tickers } = useLiveTickers()
  const feed = useMarketProfile()

  const ranked = [...tickers]
    .filter((ticker) => ticker.price > 0)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
  const mover = ranked[0]

  // Stands in for open interest when the feed is spot: the widest high-to-low
  // swing of the session, which is the closest spot equivalent of "where is the
  // risk sitting right now".
  const widest = [...tickers]
    .filter((ticker) => ticker.low > 0)
    .sort((a, b) => (b.high - b.low) / b.low - (a.high - a.low) / a.low)[0]

  const values = [
    {
      label: 'Universe 24h volume',
      value: stats ? formatUsd(stats.volume) : '...',
      note: `Summed across the ${tickers.length || 16} USDT-margined perpetuals listed in Markets.`,
    },
    feed.derivatives
      ? {
          label: 'Open interest',
          value: stats ? formatUsd(stats.openInterest) : '...',
          note: 'Notional held open on those contracts, priced at the last trade.',
        }
      : {
          label: 'Widest 24h range',
          value: widest ? formatPct(((widest.high - widest.low) / widest.low) * 100) : '...',
          note: widest
            ? `${widest.base} moved between ${formatPrice(widest.low)} and ${formatPrice(widest.high)}.`
            : 'High to low across the rolling 24 hour window.',
        },
    {
      label: 'Trading higher',
      value: stats ? `${stats.advancing} of ${stats.advancing + stats.declining}` : '...',
      note: 'Contracts up over the rolling 24 hour window.',
    },
    {
      label: 'Largest move',
      value: mover ? formatPct(mover.changePct) : '...',
      note: mover ? `${mover.base} at ${formatPrice(mover.price)}, ranked by absolute 24h change.` : 'Ranked by absolute 24h change.',
    },
  ]

  return (
    <section aria-label="Live market aggregates" className="border-y border-line bg-surface/40">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="grid divide-y divide-line md:grid-cols-2 md:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {values.map((item) => (
            <Metric key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
