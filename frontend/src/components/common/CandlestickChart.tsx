import type { Candle } from '@/lib/binance/types'

interface CandlestickChartProps {
  candles: Candle[]
  /** Rendered height in px. Width is fluid. */
  height?: number
  /** Draw the volume histogram band beneath the candles. */
  volume?: boolean
  /** Draw the right-hand price axis. */
  axis?: boolean
  /** Dim the still-forming final candle. */
  markOpenCandle?: boolean
  className?: string
}

const VIEW_W = 960
const PAD = { top: 16, right: 76, bottom: 24, left: 8 }
const VOLUME_GAP = 12
const VOLUME_RATIO = 0.17

/** Decimal places for axis labels, so cheap and expensive assets both read cleanly. */
function axisDigits(value: number): number {
  if (value >= 1000) return 0
  if (value >= 100) return 1
  if (value >= 1) return 2
  if (value >= 0.01) return 4
  return 6
}

/**
 * Candlestick chart with a price axis, gridlines, volume band and a last-price
 * marker. Every value is plotted from the supplied candles; nothing is smoothed
 * or synthesised, so a partially loaded series simply renders fewer bars.
 */
export default function CandlestickChart({
  candles,
  height = 380,
  volume = true,
  axis = true,
  markOpenCandle = true,
  className,
}: CandlestickChartProps) {
  const rightPad = axis ? PAD.right : 12
  const plotW = VIEW_W - PAD.left - rightPad
  const plotH = height - PAD.top - PAD.bottom
  const volumeH = volume ? plotH * VOLUME_RATIO : 0
  const priceH = plotH - volumeH - (volume ? VOLUME_GAP : 0)

  if (candles.length < 2) {
    return (
      <div
        className={`flex items-center justify-center ${className ?? ''}`}
        style={{ height }}
        aria-busy={candles.length === 0}
      >
        <span className="num text-[11px] text-ink-3">
          {candles.length === 0 ? 'Loading candles' : 'Waiting for the next candle'}
        </span>
      </div>
    )
  }

  const highs = candles.map((candle) => candle.h)
  const lows = candles.map((candle) => candle.l)
  const rawMax = Math.max(...highs)
  const rawMin = Math.min(...lows)
  const span = rawMax - rawMin || rawMax * 0.01 || 1
  // Breathing room above and below, so extremes never touch the frame.
  const max = rawMax + span * 0.06
  const min = rawMin - span * 0.06
  const range = max - min
  const maxVolume = Math.max(...candles.map((candle) => candle.v), 1)

  const x = (index: number) => PAD.left + (index + 0.5) * (plotW / candles.length)
  const y = (price: number) => PAD.top + ((max - price) / range) * priceH
  const slot = plotW / candles.length
  const bodyW = Math.max(1, Math.min(slot * 0.62, 14))

  const digits = axisDigits(max)
  const formatAxis = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })

  const gridlines = [0, 0.25, 0.5, 0.75, 1].map((fraction) => max - range * fraction)
  const last = candles[candles.length - 1]
  const lastY = y(last.c)
  const lastLabelY = Math.max(PAD.top + 8, Math.min(PAD.top + priceH - 8, lastY))

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW_W} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`Candlestick chart, ${candles.length} periods, last price ${formatAxis(last.c)}`}
    >
      <defs>
        <linearGradient id="candle-volume-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-long)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-long)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="candle-volume-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-short)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-short)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Price gridlines and axis labels */}
      {gridlines.map((price, index) => (
        <g key={index}>
          <line
            x1={PAD.left}
            y1={y(price)}
            x2={PAD.left + plotW}
            y2={y(price)}
            stroke="var(--color-line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {axis && (
            <text
              x={VIEW_W - rightPad + 10}
              y={y(price) + 3.5}
              fill="var(--color-ink-3)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {formatAxis(price)}
            </text>
          )}
        </g>
      ))}

      {/* Volume band */}
      {volume &&
        candles.map((candle, index) => {
          const barH = (candle.v / maxVolume) * volumeH
          const up = candle.c >= candle.o
          return (
            <rect
              key={`vol-${candle.t}`}
              x={x(index) - bodyW / 2}
              y={PAD.top + priceH + VOLUME_GAP + (volumeH - barH)}
              width={bodyW}
              height={Math.max(barH, 0.5)}
              fill={up ? 'url(#candle-volume-up)' : 'url(#candle-volume-down)'}
            />
          )
        })}

      {/* Candles */}
      {candles.map((candle, index) => {
        const up = candle.c >= candle.o
        const colour = up ? 'var(--color-long)' : 'var(--color-short)'
        const bodyTop = y(Math.max(candle.o, candle.c))
        const bodyBottom = y(Math.min(candle.o, candle.c))
        const bodyH = Math.max(bodyBottom - bodyTop, 1)
        const forming = markOpenCandle && index === candles.length - 1 && candle.open

        return (
          <g key={candle.t} opacity={forming ? 0.72 : 1}>
            <line
              x1={x(index)}
              y1={y(candle.h)}
              x2={x(index)}
              y2={y(candle.l)}
              stroke={colour}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={x(index) - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={up ? 'var(--color-long)' : 'var(--color-short)'}
              fillOpacity={up ? 0.75 : 0.85}
              stroke={colour}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )
      })}

      {/* Last price marker */}
      <line
        x1={PAD.left}
        y1={lastY}
        x2={PAD.left + plotW}
        y2={lastY}
        stroke="var(--color-accent)"
        strokeWidth="1"
        strokeDasharray="3 4"
        vectorEffect="non-scaling-stroke"
      />
      {axis && (
        <>
          <rect
            x={VIEW_W - rightPad + 4}
            y={lastLabelY - 9}
            width={rightPad - 8}
            height={18}
            rx="3"
            fill="var(--color-accent-deep)"
          />
          <text
            x={VIEW_W - rightPad + 10}
            y={lastLabelY + 3.5}
            fill="var(--color-ink)"
            fontSize="10"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            {formatAxis(last.c)}
          </text>
        </>
      )}
    </svg>
  )
}
