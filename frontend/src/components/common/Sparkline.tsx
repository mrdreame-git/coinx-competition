interface SparklineProps {
  /** Raw series, oldest first. Rendered as-is; no smoothing or interpolation. */
  data: number[]
  positive: boolean
  width?: number
  height?: number
  /** Fill the area beneath the line. Off for dense tables, on for hero tiles. */
  area?: boolean
  className?: string
}

/**
 * A real close-price sparkline. Renders nothing when there are fewer than two
 * points, so a loading table shows an empty cell rather than a misleading line.
 */
export default function Sparkline({
  data,
  positive,
  width = 96,
  height = 28,
  area = false,
  className,
}: SparklineProps) {
  if (data.length < 2) {
    return <div className={className} style={{ width, height }} aria-hidden />
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pad = 2
  const usable = height - pad * 2

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = pad + (1 - (value - min) / range) * usable
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const fill = `${points[0][0]},${height} ${line} ${points[points.length - 1][0]},${height}`
  const stroke = positive ? 'var(--color-long)' : 'var(--color-short)'
  const gradientId = `spark-${positive ? 'up' : 'down'}`

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`24 hour trend, ${positive ? 'up' : 'down'}`}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={fill} fill={`url(#${gradientId})`} />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
