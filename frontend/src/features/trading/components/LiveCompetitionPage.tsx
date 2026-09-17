"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ROUTES } from "@/config/app"
import { COMPETITIONS } from "@/mocks/competitions"
import { LEADERBOARD_DATA } from "@/mocks/leaderboard"
import {
  generateOrderBook,
  generateTape,
  generateDepth,
  MY_POSITIONS,
  MY_OPEN_ORDERS,
  MY_FILLED_ORDERS,
  TRADE_LOG_ENTRIES,
} from "@/mocks/markets"
import { formatCryptoAmount } from "@/lib/format"

type Side = "buy" | "sell"
type OrderType = "market" | "limit"
type PosTab = "positions" | "orders" | "history"

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"]
const LEVERAGE_OPTIONS = ["1x", "2x", "3x", "5x", "10x"]
const SIZE_PRESETS = ["25%", "50%", "75%", "100%"]

const MID_PRICE = 118245

const CHART_CANDLES: { wickTop: number; wickH: number; bodyTop: number; bodyH: number; up: boolean }[] =
  Array.from({ length: 48 }, (_, i) => {
    const x = Math.sin(i * 12.9898) * 43758.5453
    const r = x - Math.floor(x)
    return {
      wickTop: 30 + ((r * 37) % 180),
      wickH: 40 + ((r * 37) % 220),
      bodyTop: 60 + (((r * 137) % 200)),
      bodyH: 25 + ((r * 79) % 70),
      up: r > 0.42,
    }
  })

function OrderModal({
  side,
  amount,
  leverage,
  orderType,
  limitPrice,
  onCancel,
  onDone,
}: {
  side: Side
  amount: string
  leverage: string
  orderType: OrderType
  limitPrice: string
  onCancel: () => void
  onDone: () => void
}) {
  const [done, setDone] = useState(false)
  const price = orderType === "limit" ? parseFloat(limitPrice || "0") : MID_PRICE
  const lev = parseInt(leverage)
  const size = parseFloat(amount || "0")
  const qty = size / price
  const margin = size / lev
  const fee = size * 0.0005

  if (done) {
    return (
      <div
        className="glass rounded-2xl p-8 w-full max-w-sm text-center"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(0,208,132,0.15)", border: "2px solid rgba(0,208,132,0.4)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D084" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="font-black text-xl mb-1" style={{ color: "#FFFFFF" }}>ORDER EXECUTED</div>
        <div className="text-sm mb-6" style={{ color: "#00D084" }}>
          {side.toUpperCase()} {formatCryptoAmount(qty)} BTC
        </div>
        <div className="space-y-2 mb-6">
          {[
            ["Position", `${formatCryptoAmount(qty)} BTC`],
            ["Entry Price", price.toLocaleString()],
            ["Leverage", leverage],
            ["Margin", `${margin.toFixed(2)} USDT`],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-sm" style={{ color: "#A4AEC0" }}>{l}</span>
              <span className="text-sm font-mono font-semibold" style={{ color: "#E5EAF3" }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={onDone} className="btn-primary w-full py-3 rounded-xl text-sm font-bold">
          BACK TO TRADING
        </button>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-8 w-full max-w-sm" role="dialog" aria-modal="true">
      <h3 className="font-black text-xl mb-1" style={{ color: "#FFFFFF" }}>
        CONFIRM {side.toUpperCase()}
      </h3>
      <div className="text-sm mb-6" style={{ color: "#A4AEC0" }}>BTC / USDT · {leverage}</div>
      <div className="space-y-3 mb-8">
        {[
          ["Order Type", orderType === "limit" ? "Limit" : "Market"],
          ["Price", orderType === "limit" ? `${price.toLocaleString()} USDT` : "Market"],
          ["Amount", `${size} USDT`],
          ["Quantity", `${formatCryptoAmount(qty)} BTC`],
          ["Margin", `${margin.toFixed(2)} USDT`],
          ["Fee", `${fee.toFixed(4)} USDT`],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-sm" style={{ color: "#A4AEC0" }}>{l}</span>
            <span className="text-sm font-mono font-semibold" style={{ color: "#E5EAF3" }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-ghost flex-1 py-3 rounded-xl text-sm">CANCEL</button>
        <button
          onClick={() => setDone(true)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold ${side === "buy" ? "btn-success" : "btn-danger"}`}
        >
          CONFIRM {side.toUpperCase()}
        </button>
      </div>
    </div>
  )
}

export default function LiveCompetitionPage() {
  const router = useRouter()
  const { competitionId } = useParams<{ competitionId: string }>()
  const comp = COMPETITIONS.find((c) => c.id === Number(competitionId)) ?? COMPETITIONS[0]

  const [side, setSide] = useState<Side>("buy")
  const [orderType, setOrderType] = useState<OrderType>("market")
  const [amount, setAmount] = useState("50")
  const [leverage, setLeverage] = useState("5x")
  const [limitPrice, setLimitPrice] = useState(MID_PRICE.toString())
  const [sizePct, setSizePct] = useState(75)
  const [timeframe, setTimeframe] = useState("1H")
  const [posTab, setPosTab] = useState<PosTab>("positions")
  const [tpSlOn, setTpSlOn] = useState(false)
  const [tp, setTp] = useState("")
  const [sl, setSl] = useState("")
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [compEnded, setCompEnded] = useState(false)

  const orderBook = useMemo(() => generateOrderBook(MID_PRICE), [])
  const tape = useMemo(() => generateTape(MID_PRICE), [])
  const depth = useMemo(() => generateDepth(), [])

  const maxAvailable = 72.4
  const lev = parseInt(leverage)
  const size = parseFloat(amount || "0")
  const orderValue = size
  const marginUsed = size / lev
  const estQty = size / MID_PRICE

  if (compEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080D18" }}>
        <div className="relative z-10 text-center max-w-md glass rounded-2xl p-10">
          <div className="text-xs font-semibold mb-3" style={{ color: "#A4AEC0" }}>COMPETITION FINISHED</div>
          <h2 className="font-black text-3xl mb-2" style={{ color: "#FFFFFF" }}>YOUR FINAL RESULT</h2>
          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="glass-blue rounded-xl p-4 text-center">
              <div className="text-xs mb-1" style={{ color: "#A4AEC0" }}>RANK</div>
              <div className="font-black text-4xl font-mono" style={{ color: "#FFB020" }}>#7</div>
              <div className="text-xs" style={{ color: "#A4AEC0" }}>/ 284</div>
            </div>
            <div className="glass-blue rounded-xl p-4 text-center">
              <div className="text-xs mb-1" style={{ color: "#A4AEC0" }}>RETURN</div>
              <div className="font-black text-4xl font-mono" style={{ color: "#00D084" }}>+31.4%</div>
            </div>
          </div>
          <button onClick={() => router.push(ROUTES.results(comp.id))} className="btn-cyan w-full py-3.5 rounded-xl font-bold">
            VIEW RESULTS
          </button>
        </div>
      </div>
    )
  }

  if (showOrderModal) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "rgba(8,13,24,0.95)" }}>
        <OrderModal
          side={side}
          amount={amount}
          leverage={leverage}
          orderType={orderType}
          limitPrice={limitPrice}
          onCancel={() => setShowOrderModal(false)}
          onDone={() => setShowOrderModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      {/* Trading Header */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "rgba(8,13,24,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="h-10 flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => router.push(ROUTES.markets)}
            className="px-5 h-full flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
            style={{ background: "rgba(0,208,132,0.1)", color: "#00D084", borderRight: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="font-black" style={{ color: "#00D084" }}>BTC</span>
            <span className="text-[10px] font-mono" style={{ color: "#A4AEC0" }}>/USDT</span>
            <span className="font-mono text-sm font-bold" style={{ color: "#00D084" }}>118,245</span>
            <span className="text-[11px] font-mono" style={{ color: "#00D084" }}>+1.24%</span>
          </button>
          {["ETH", "SOL", "BNB"].map((sym) => (
            <button
              key={sym}
              className="px-5 h-full flex items-center gap-2 text-sm"
              style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-bold" style={{ color: "#FFFFFF" }}>{sym}</span>
              <span className="font-mono text-[11px]" style={{ color: "#A4AEC0" }}>/USDT</span>
              <span className="font-mono text-sm font-bold" style={{ color: sym === "ETH" ? "#00D084" : sym === "SOL" ? "#FF4D67" : "#00D084" }}>
                {sym === "ETH" ? "3,842" : sym === "SOL" ? "247.83" : "682.40"}
              </span>
              <span className="text-[11px] font-mono" style={{ color: sym === "ETH" ? "#00D084" : sym === "SOL" ? "#FF4D67" : "#00D084" }}>
                {sym === "ETH" ? "+2.87%" : sym === "SOL" ? "-0.42%" : "+0.95%"}
              </span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-6 px-5">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Equity</div>
              <div className="font-mono text-sm font-bold" style={{ color: "#FFFFFF" }}>1,108.42</div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Session P&L</div>
              <div className="font-mono text-sm font-bold" style={{ color: "#00D084" }}>+8.42</div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Rank</div>
              <div className="text-base font-bold" style={{ color: "#00C8FF" }}>
                #12<span className="font-mono text-xs" style={{ color: "#A4AEC0" }}> / 284</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Grid */}
      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 250px 314px", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
        {/* Chart + Positions */}
        <div style={{ background: "#080D18" }}>
          {/* Chart Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(12,19,32,0.5)" }}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-lg uppercase" style={{ color: "#FFFFFF" }}>{comp.pair}</span>
              <span className="font-mono text-xl font-black" style={{ color: "#00D084" }}>118,245</span>
              <span className="text-xs font-mono" style={{ color: "#00D084" }}>+1.24%</span>
            </div>
            <div className="flex gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all"
                  style={{
                    background: timeframe === tf ? "rgba(22,119,255,0.15)" : "transparent",
                    color: timeframe === tf ? "#00C8FF" : "#A4AEC0",
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Candlestick Chart */}
          <div className="relative" style={{ height: "342px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Grid lines */}
            {["20%", "40%", "60%", "80%"].map((top) => (
              <div
                key={top}
                className="absolute left-0 right-0"
                style={{ top, height: "1px", background: "rgba(255,255,255,0.03)" }}
              />
            ))}
            {/* Price labels */}
            {["118,800", "118,600", "118,400", "118,200", "118,000"].map((p, i) => (
              <div
                key={p}
                className="absolute right-2 text-[10.5px] font-mono"
                style={{ top: `${15 + i * 18}%`, color: "#A4AEC0" }}
              >
                {p}
              </div>
            ))}
            {/* Current price line */}
            <div className="absolute left-0 right-0" style={{ top: "55%", height: "1px", background: "#00C8FF", opacity: 0.4 }} />
            {/* SVG Candlestick Chart */}
            <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 800 342" preserveAspectRatio="none">
              {CHART_CANDLES.map((c, i) => {
                const x = 30 + i * 16
                const col = c.up ? "#00D084" : "#FF4D67"
                return (
                  <g key={i}>
                    <line x1={x} y1={c.wickTop} x2={x} y2={c.wickTop + c.wickH} stroke={col} strokeWidth="1" />
                    <rect x={x - 4} y={c.bodyTop} width="8" height={c.bodyH} fill={col} rx="1" />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Chart footer */}
          <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span>COINX · {timeframe}</span>
            <span>O 118,200 H 118,500 L 118,100 C 118,245</span>
          </div>

          {/* Positions/Orders/History */}
          <div style={{ background: "rgba(12,19,32,0.3)" }}>
            <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {(["positions", "orders", "history"] as PosTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPosTab(t)}
                  className="px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all"
                  style={{
                    color: posTab === t ? "#00C8FF" : "#A4AEC0",
                    borderBottom: posTab === t ? "2px solid #1677FF" : "2px solid transparent",
                  }}
                >
                  {t} {t === "positions" ? `(${MY_POSITIONS.length})` : t === "orders" ? `(${MY_OPEN_ORDERS.length})` : ""}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div
              className="grid items-center h-8 text-[10.5px] font-mono tracking-widest uppercase px-3"
              style={{
                gridTemplateColumns: posTab === "positions" ? "84px 86px 96px 108px 108px 112px 104px 92px 1fr" : "100px 120px 86px 96px 130px 120px 1fr",
                color: "#A4AEC0",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {posTab === "positions" ? (
                <>
                  <div className="px-2">Symbol</div>
                  <div className="px-1">Side</div>
                  <div className="px-1 text-right">Size</div>
                  <div className="px-1 text-right">Entry</div>
                  <div className="px-1 text-right">Mark</div>
                  <div className="px-1 text-right">Liq. price</div>
                  <div className="px-1 text-right">P&L</div>
                  <div className="px-1 text-right">Margin</div>
                  <div className="px-2 text-right">Action</div>
                </>
              ) : (
                <>
                  <div className="px-2">Time</div>
                  <div className="px-1">Symbol</div>
                  <div className="px-1">Side</div>
                  <div className="px-1">Type</div>
                  <div className="px-1 text-right">Price</div>
                  <div className="px-1 text-right">Qty</div>
                  <div className="px-2 text-right">Status</div>
                </>
              )}
            </div>

            {posTab === "positions" &&
              MY_POSITIONS.map((p) => (
                <div
                  key={p.symbol}
                  className="grid items-center h-10 px-3 font-mono text-[12.5px]"
                  style={{
                    gridTemplateColumns: "84px 86px 96px 108px 108px 112px 104px 92px 1fr",
                    borderTop: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="px-2 font-bold" style={{ color: "#FFFFFF" }}>{p.symbol}</div>
                  <div className="px-1" style={{ color: p.side === "Long" ? "#00D084" : "#FF4D67" }}>
                    {p.side} {p.leverage}
                  </div>
                  <div className="px-1 text-right" style={{ color: "#C8D0DC" }}>{p.qty}</div>
                  <div className="px-1 text-right" style={{ color: "#C8D0DC" }}>{p.entry}</div>
                  <div className="px-1 text-right" style={{ color: "#C8D0DC" }}>{p.mark}</div>
                  <div className="px-1 text-right" style={{ color: "#FF4D67" }}>{p.liq}</div>
                  <div className="px-1 text-right font-bold" style={{ color: p.pnlColor }}>
                    {p.pnl > 0 ? "+" : ""}{p.pnl.toFixed(2)}
                  </div>
                  <div className="px-1">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="w-8 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <span className="block h-full rounded-full" style={{ width: `${p.marginRatio}%`, background: p.side === "Long" ? "#00D084" : "#FF4D67" }} />
                      </span>
                      <span className="text-[11px]" style={{ color: p.side === "Long" ? "#00D084" : "#FF4D67" }}>
                        {p.marginRatio}%
                      </span>
                    </div>
                  </div>
                  <div className="px-2 text-right">
                    <button
                      className="px-2.5 py-1 text-[11px] tracking-wider uppercase transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#B8C0CC" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#FF4D67"
                        e.currentTarget.style.color = "#FF4D67"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                        e.currentTarget.style.color = "#B8C0CC"
                      }}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              ))}

            {posTab === "orders" &&
              MY_OPEN_ORDERS.map((o, i) => (
                <div
                  key={i}
                  className="grid items-center h-10 px-3 font-mono text-[12.5px]"
                  style={{
                    gridTemplateColumns: "100px 120px 86px 96px 130px 120px 1fr",
                    borderTop: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="px-2" style={{ color: "#A4AEC0" }}>{o.time}</div>
                  <div className="px-1 font-bold" style={{ color: "#FFFFFF" }}>{o.symbol}</div>
                  <div className="px-1" style={{ color: o.side === "Buy" ? "#00D084" : "#FF4D67" }}>{o.side}</div>
                  <div className="px-1" style={{ color: "#B8C0CC" }}>{o.type}</div>
                  <div className="px-1 text-right">{o.price}</div>
                  <div className="px-1 text-right" style={{ color: "#C8D0DC" }}>{o.qty}</div>
                  <div className="px-2 text-right">
                    <button
                      className="px-2.5 py-1 text-[11px] tracking-wider uppercase"
                      style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#B8C0CC" }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ))}

            {posTab === "history" &&
              MY_FILLED_ORDERS.map((o, i) => (
                <div
                  key={i}
                  className="grid items-center h-10 px-3 font-mono text-[12.5px]"
                  style={{
                    gridTemplateColumns: "100px 120px 86px 96px 130px 120px 1fr",
                    borderTop: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="px-2" style={{ color: "#A4AEC0" }}>{o.time}</div>
                  <div className="px-1 font-bold" style={{ color: "#FFFFFF" }}>{o.symbol}</div>
                  <div className="px-1" style={{ color: o.side === "Buy" ? "#00D084" : "#FF4D67" }}>{o.side}</div>
                  <div className="px-1" style={{ color: "#B8C0CC" }}>{o.type}</div>
                  <div className="px-1 text-right">{o.price}</div>
                  <div className="px-1 text-right" style={{ color: "#C8D0DC" }}>{o.qty}</div>
                  <div className="px-2 text-right tracking-wider" style={{ color: o.status === "Filled" ? "#00D084" : "#A4AEC0" }}>
                    {o.status.toUpperCase()}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Order Book */}
        <div style={{ background: "rgba(12,19,32,0.5)" }}>
          <div className="px-3 py-2 text-[10.5px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Order book
          </div>
          <div className="grid grid-cols-3 px-3 py-1 text-[10px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>
            <span>Price</span>
            <span style={{ textAlign: "right" }}>Size</span>
            <span style={{ textAlign: "right" }}>Total</span>
          </div>
          {orderBook.asks.map((a, i) => (
            <div
              key={i}
              className="relative grid grid-cols-3 px-3 h-5 items-center font-mono text-[11.5px]"
            >
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{ width: `${(a.total / orderBook.asks[orderBook.asks.length - 1].total) * 100}%`, background: "#FF4D67", opacity: 0.12 }}
              />
              <span className="relative" style={{ color: "#FF4D67" }}>{a.price.toLocaleString()}</span>
              <span className="relative text-right" style={{ color: "#C8D0DC" }}>{a.qty.toFixed(3)}</span>
              <span className="relative text-right" style={{ color: "#A4AEC0" }}>{a.total.toFixed(3)}</span>
            </div>
          ))}
          <div
            className="flex items-baseline gap-2 px-3 py-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}
          >
            <span className="font-mono text-base font-bold" style={{ color: "#00D084" }}>118,245</span>
            <span className="text-[10.5px] font-mono" style={{ color: "#A4AEC0" }}>spread {orderBook.spread}</span>
          </div>
          {orderBook.bids.map((b, i) => (
            <div
              key={i}
              className="relative grid grid-cols-3 px-3 h-5 items-center font-mono text-[11.5px]"
            >
              <div
                className="absolute right-0 top-0 bottom-0"
                style={{ width: `${(b.total / orderBook.bids[orderBook.bids.length - 1].total) * 100}%`, background: "#00D084", opacity: 0.12 }}
              />
              <span className="relative" style={{ color: "#00D084" }}>{b.price.toLocaleString()}</span>
              <span className="relative text-right" style={{ color: "#C8D0DC" }}>{b.qty.toFixed(3)}</span>
              <span className="relative text-right" style={{ color: "#A4AEC0" }}>{b.total.toFixed(3)}</span>
            </div>
          ))}

          {/* Depth Chart */}
          <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="text-[9.5px] font-mono tracking-widest uppercase mb-2" style={{ color: "#A4AEC0" }}>Depth</div>
            <div className="flex items-end gap-0.5" style={{ height: "56px" }}>
              <div className="flex-1 flex items-end gap-px h-full">
                {depth.bids.slice(0, 18).map((d, i) => (
                  <span key={i} className="flex-1 rounded-t-sm" style={{ height: d.height, background: "#00D084", opacity: 0.4 }} />
                ))}
              </div>
              <div className="flex-1 flex items-end gap-px h-full">
                {depth.asks.slice(0, 18).map((d, i) => (
                  <span key={i} className="flex-1 rounded-t-sm" style={{ height: d.height, background: "#FF4D67", opacity: 0.4 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Trade Tape */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="px-3 py-1.5 text-[9.5px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Trades</div>
            {tape.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-3 px-3 h-5 items-center font-mono text-[11px]"
              >
                <span style={{ color: t.side === "buy" ? "#00D084" : "#FF4D67" }}>{t.price.toLocaleString()}</span>
                <span className="text-right" style={{ color: "#C8D0DC" }}>{t.qty.toFixed(4)}</span>
                <span className="text-right" style={{ color: "#A4AEC0" }}>{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div style={{ background: "rgba(12,19,32,0.5)" }}>
          <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => setOrderType("market")}
              className="flex-1 text-center py-2.5 text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                color: orderType === "market" ? "#00C8FF" : "#A4AEC0",
                borderBottom: orderType === "market" ? "2px solid #1677FF" : "2px solid transparent",
              }}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className="flex-1 text-center py-2.5 text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                color: orderType === "limit" ? "#00C8FF" : "#A4AEC0",
                borderBottom: orderType === "limit" ? "2px solid #1677FF" : "2px solid transparent",
              }}
            >
              Limit
            </button>
          </div>

          {/* Long/Short Toggle */}
          <div className="grid grid-cols-2 gap-px mx-3 mt-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => setSide("buy")}
              className="py-2.5 text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                background: side === "buy" ? "rgba(0,208,132,0.2)" : "rgba(12,19,32,0.5)",
                color: side === "buy" ? "#00D084" : "#A4AEC0",
              }}
            >
              Long
            </button>
            <button
              onClick={() => setSide("sell")}
              className="py-2.5 text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                background: side === "sell" ? "rgba(255,77,103,0.2)" : "rgba(12,19,32,0.5)",
                color: side === "sell" ? "#FF4D67" : "#A4AEC0",
              }}
            >
              Short
            </button>
          </div>

          <div className="p-3 space-y-3">
            {/* Leverage */}
            <div>
              <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase mb-1.5" style={{ color: "#A4AEC0" }}>
                <span>Leverage</span>
                <span style={{ color: "#00C8FF" }}>{leverage}</span>
              </div>
              <div className="grid grid-cols-5 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
                {LEVERAGE_OPTIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLeverage(l)}
                    className="py-2 text-[11.5px] font-mono text-center transition-all"
                    style={{
                      background: leverage === l ? "rgba(22,119,255,0.2)" : "rgba(12,19,32,0.5)",
                      color: leverage === l ? "#00C8FF" : "#A4AEC0",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Price (only for limit orders) */}
            {orderType === "limit" && (
              <div>
                <div className="text-[10px] font-mono tracking-widest uppercase mb-1.5" style={{ color: "#A4AEC0" }}>Limit price</div>
                <input
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono input-field"
                />
              </div>
            )}

            {/* Size */}
            <div>
              <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase mb-1.5" style={{ color: "#A4AEC0" }}>
                <span>Size</span>
                <span>{sizePct}% of balance</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={sizePct}
                onChange={(e) => {
                  const p = parseInt(e.target.value)
                  setSizePct(p)
                  setAmount((maxAvailable * (p / 100)).toFixed(2))
                }}
                className="w-full"
                style={{ accentColor: "#1677FF" }}
              />
              <div className="grid grid-cols-4 gap-px mt-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                {SIZE_PRESETS.map((p) => {
                  const pct = parseInt(p)
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setSizePct(pct)
                        setAmount((maxAvailable * (pct / 100)).toFixed(2))
                      }}
                      className="py-1.5 text-[11px] font-mono transition-all"
                      style={{
                        background: sizePct === pct ? "rgba(22,119,255,0.15)" : "rgba(12,19,32,0.5)",
                        color: sizePct === pct ? "#00C8FF" : "#A4AEC0",
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase mb-1.5" style={{ color: "#A4AEC0" }}>Amount (USDT)</div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm font-mono input-field"
              />
            </div>

            {/* TP/SL Toggle */}
            <div>
              <button
                onClick={() => setTpSlOn(!tpSlOn)}
                className="flex justify-between items-center w-full text-[10px] font-mono tracking-widest uppercase"
                style={{ color: "#A4AEC0" }}
              >
                <span>Take profit / stop loss</span>
                <span style={{ fontSize: "14px", color: "#00C8FF" }}>{tpSlOn ? "−" : "+"}</span>
              </button>
              {tpSlOn && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <div className="text-[9px] font-mono mb-1" style={{ color: "#00D084" }}>TP</div>
                    <input
                      value={tp}
                      onChange={(e) => setTp(e.target.value)}
                      placeholder="Price"
                      className="w-full px-2.5 py-2 rounded-lg text-[12.5px] font-mono input-field"
                      style={{ borderLeft: "2px solid #00D084" }}
                    />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono mb-1" style={{ color: "#FF4D67" }}>SL</div>
                    <input
                      value={sl}
                      onChange={(e) => setSl(e.target.value)}
                      placeholder="Price"
                      className="w-full px-2.5 py-2 rounded-lg text-[12.5px] font-mono input-field"
                      style={{ borderLeft: "2px solid #FF4D67" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-1.5 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", fontFamily: "var(--font-mono)", fontSize: "11.5px" }}>
              <div className="flex justify-between">
                <span style={{ color: "#A4AEC0" }}>Order value</span>
                <span style={{ color: "#E5EAF3" }}>{orderValue.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#A4AEC0" }}>Margin used</span>
                <span style={{ color: "#E5EAF3" }}>{marginUsed.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#A4AEC0" }}>Quantity</span>
                <span style={{ color: "#E5EAF3" }}>{formatCryptoAmount(estQty)} BTC</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#A4AEC0" }}>Fee (0.05%)</span>
                <span style={{ color: "#A4AEC0" }}>{(orderValue * 0.0005).toFixed(4)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#A4AEC0" }}>Available</span>
                <span style={{ color: "#E5EAF3" }}>{maxAvailable.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={() => setShowOrderModal(true)}
              className={`w-full py-3.5 rounded-xl text-sm font-black tracking-wide ${side === "buy" ? "btn-success" : "btn-danger"}`}
            >
              {side === "buy" ? "LONG" : "SHORT"} BTC · {leverage}
            </button>
            <div className="text-center text-[10px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>
              Competition account
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
