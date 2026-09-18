'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useLiveTickers } from '@/lib/binance/hooks'
import { formatPrice } from '@/lib/format'
import ChangeTag from '@/components/common/ChangeTag'

interface TickerTapeProps {
  /** Restrict the tape to these bases. Defaults to the whole universe. */
  bases?: string[]
  /** Seconds for one full pass. Slower for dense tapes. */
  speed?: number
}

function TapeItem({
  base,
  price,
  changePct,
}: {
  base: string
  price: number
  changePct: number
}) {
  return (
    <li className="flex shrink-0 items-center gap-2.5 px-5">
      <span className="text-[12px] font-semibold tracking-wide text-ink">{base}</span>
      <span className="num text-[12px] text-ink-2">{formatPrice(price)}</span>
      <ChangeTag value={changePct} size="sm" caret={false} />
    </li>
  )
}

/**
 * Live market tape. One marquee per page (skill.md Section 5), so it is used at
 * most once on any given view. Under reduced motion it degrades to a scrollable
 * static row rather than animating forever.
 */
export default function TickerTape({ bases, speed = 46 }: TickerTapeProps) {
  const { tickers, loading, error } = useLiveTickers()
  const reduce = useReducedMotion()

  const list = bases
    ? bases.flatMap((base) => tickers.find((t) => t.base === base) ?? [])
    : tickers

  if (error) {
    return (
      <div className="flex h-11 items-center border-y border-line px-5">
        <span className="num text-[11px] text-ink-3">Market feed offline</span>
      </div>
    )
  }

  if (loading || list.length === 0) {
    return (
      <div className="flex h-11 items-center gap-5 border-y border-line px-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="skeleton h-3 w-32" />
        ))}
      </div>
    )
  }

  if (reduce) {
    return (
      <div className="scrollbar-none overflow-x-auto border-y border-line">
        <ul className="flex w-max items-center py-3">
          {list.map((ticker) => (
            <TapeItem key={ticker.symbol} {...ticker} />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden border-y border-line">
      <motion.div
        className="flex w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        <ul className="flex items-center py-3">
          {list.map((ticker) => (
            <TapeItem key={ticker.symbol} {...ticker} />
          ))}
        </ul>
        <ul className="flex items-center py-3" aria-hidden>
          {list.map((ticker) => (
            <TapeItem key={`${ticker.symbol}-copy`} {...ticker} />
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
