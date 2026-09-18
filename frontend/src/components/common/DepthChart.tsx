import type { DepthLevel } from '@/lib/binance/types'
import { formatPrice, formatUsd } from '@/lib/format'

interface DepthChartProps {
  bids: DepthLevel[]
  asks: DepthLevel[]
  height?: number
}

interface Point {
  price: number
  cumulative: number
}

/** Cumulative notional from the top of book outward. */
function accumulate(levels: DepthLevel[]): Point[] {
  let running = 0
  return levels.map((level) => {
    running += level.price * level.qty
    return { price: level.price, cumulative: running }
  })
}

/**
 * Cumulative depth for both sides of the book. Bids slope down toward the spread
 * from the left, asks slope up to the right, and the gap between them is the
 * spread. Every point comes from the fetched book.
 */
export default function DepthChart({ bids, asks, height = 120 }: DepthChartProps) {
  if (bids.length < 2 || asks.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="num text-[11px] text-ink-3">Awaiting book depth</span>
      </div>
    )
  }

  // Ascending price for both series so they can share one x scale.
  const bidSeries = accumulate(bids).reverse()
  const askSeries = accumulate(asks)

  const minPrice = bidSeries[0].price
  const maxPrice = askSeries[askSeries.length - 1].price
  const priceRange = maxPrice - minPrice || 1
  const maxCumulative = Math.max(
    bidSeries[0].cumulative,
    askSeries[askSeries.length - 1].cumulative,
  )

  const width = 480
  const pad = 6
  const plotH = height - pad * 2

  const x = (price: number) => ((price - minPrice) / priceRange) * width
  const y = (cumulative: number) => pad + (1 - cumulative / maxCumulative) * plotH

  const toArea = (series: Point[]) =>
    [
      `${x(series[0].price).toFixed(2)},${height}`,
      ...series.map((point) => `${x(point.price).toFixed(2)},${y(point.cumulative).toFixed(2)}`),
      `${x(series[series.length - 1].price).toFixed(2)},${height}`,
    ].join(' ')

  const midPrice = (bidSeries[bidSeries.length - 1].price + askSeries[0].price) / 2

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Cumulative order book depth, mid price ${formatPrice(midPrice)}`}
      >
        <defs>
          <linearGradient id="depth-bid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-long)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--color-long)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="depth-ask" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-short)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--color-short)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <polygon points={toArea(bidSeries)} fill="url(#depth-bid)" />
        <polyline
          points={bidSeries.map((p) => `${x(p.price)},${y(p.cumulative)}`).join(' ')}
          fill="none"
          stroke="var(--color-long)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        <polygon points={toArea(askSeries)} fill="url(#depth-ask)" />
        <polyline
          points={askSeries.map((p) => `${x(p.price)},${y(p.cumulative)}`).join(' ')}
          fill="none"
          stroke="var(--color-short)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        <line
          x1={x(midPrice)}
          y1={0}
          x2={x(midPrice)}
          y2={height}
          stroke="var(--color-line-strong)"
          strokeWidth="1"
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <figcaption className="flex items-center justify-between">
        <span className="num text-[10.5px] text-ink-3">
          Bids {formatUsd(bidSeries[0].cumulative)}
        </span>
        <span className="num text-[10.5px] text-ink-3">Mid {formatPrice(midPrice)}</span>
        <span className="num text-[10.5px] text-ink-3">
          Asks {formatUsd(askSeries[askSeries.length - 1].cumulative)}
        </span>
      </figcaption>
    </figure>
  )
}
