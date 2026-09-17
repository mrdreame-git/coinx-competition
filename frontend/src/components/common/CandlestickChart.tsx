interface Candle {
  o: number
  h: number
  l: number
  c: number
}

interface CandlestickChartProps {
  height?: number
  candles: Candle[]
}

export default function CandlestickChart({
  height = 280,
  candles,
}: CandlestickChartProps) {
  if (candles.length === 0) {
    return <div className="flex w-full items-center justify-center text-xs font-mono text-text-muted" style={{ height }}>Loading candles...</div>
  }

  const w = 600
  const h2 = height
  const pad = { top: 16, bottom: 24, left: 8, right: 60 }
  const allPrices = candles.flatMap((c) => [c.h, c.l])
  const minP = Math.min(...allPrices) - 100
  const maxP = Math.max(...allPrices) + 100
  const range = maxP - minP
  const chartW = w - pad.left - pad.right
  const chartH = h2 - pad.top - pad.bottom
  const candleW = chartW / candles.length
  const py = (price: number) => pad.top + ((maxP - price) / range) * chartH
  const px = (i: number) => pad.left + i * candleW + candleW * 0.5

  const labels = [
    minP + range * 0.75,
    minP + range * 0.5,
    minP + range * 0.25,
  ].map(Math.round)

  return (
    <svg viewBox={`0 0 ${w} ${h2}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#00C8FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {labels.map((p, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            y1={py(p)}
            x2={w - pad.right}
            y2={py(p)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
          <text
            x={w - pad.right + 6}
            y={py(p) + 4}
            fill="#A4AEC0"
            fontSize="9"
            fontFamily="JetBrains Mono"
          >
            {p.toLocaleString()}
          </text>
        </g>
      ))}
      {candles.map((c, i) => {
        const up = c.c >= c.o
        const color = up ? "#00D084" : "#FF4D67"
        const bodyTop = py(Math.max(c.o, c.c))
        const bodyBot = py(Math.min(c.o, c.c))
        const bodyH = Math.max(bodyBot - bodyTop, 1)
        const bw = candleW * 0.55
        return (
          <g key={i}>
            <line
              x1={px(i)}
              y1={py(c.h)}
              x2={px(i)}
              y2={py(c.l)}
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.8"
            />
            <rect
              x={px(i) - bw / 2}
              y={bodyTop}
              width={bw}
              height={bodyH}
              fill={color}
              fillOpacity={up ? "0.85" : "0.75"}
              rx="1"
            />
          </g>
        )
      })}
      <line
        x1={px(candles.length - 1)}
        y1={0}
        x2={px(candles.length - 1)}
        y2={h2}
        stroke="rgba(0,200,255,0.15)"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <circle
        cx={px(candles.length - 1)}
        cy={py(candles[candles.length - 1].c)}
        r="3"
        fill="#00C8FF"
      />
    </svg>
  )
}
