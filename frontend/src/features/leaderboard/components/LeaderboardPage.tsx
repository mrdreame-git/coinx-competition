"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import { COMPETITIONS } from "@/mocks/competitions"
import { LEADERBOARD_DATA } from "@/mocks/leaderboard"
import { MARKETS, TRADE_LOG_ENTRIES } from "@/mocks/markets"
import { formatPercentage } from "@/lib/format"

type View = "boardA" | "boardB"

const POSITIONING = {
  longPct: "64%",
  shortPct: "36%",
  longWidth: "64%",
  symbols: [
    { k: "BTC", longPct: "72%", longWidth: "72%" },
    { k: "ETH", longPct: "58%", longWidth: "58%" },
    { k: "SOL", longPct: "41%", longWidth: "41%" },
    { k: "BNB", longPct: "68%", longWidth: "68%" },
  ],
}

export default function LeaderboardPage() {
  const [comp, setComp] = useState(COMPETITIONS[0].name)
  const [view, setView] = useState<View>("boardB")

  const boardRows = LEADERBOARD_DATA.map((r, i) => {
    let move: string
    if (i < 3) {
      move = `+${(((Math.sin(i * 3.77) + 1) * 0.1) + 0.5).toFixed(1)}%`
    } else if (i < 6) {
      move = `+${(((Math.sin(i * 5.55) + 1) * 0.11) + 0.02).toFixed(2)}%`
    } else {
      move = `-${(((Math.sin(i * 7.1) + 1) * 0.15)).toFixed(2)}%`
    }
    return {
      ...r,
      bar: i === 0 ? "#FFB020" : i === 1 ? "#A4AEC0" : i === 2 ? "#cd7f32" : "#1677FF",
      rowBg: r.isUser ? "linear-gradient(90deg, rgba(22,119,255,0.12), rgba(0,200,255,0.06))" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
      book: r.isUser ? "Long" : i % 3 === 0 ? "Short" : "Long",
      dirColor: (r.isUser || i % 3 !== 0) ? "#00D084" : "#FF4D67",
      pnlColor: r.returnPct > 0 ? "#00D084" : "#FF4D67",
      moveColor: i < 3 ? "#00D084" : i < 6 ? "#FFB020" : "#FF4D67",
      move,
    }
  })

  const podium = [
    {
      rank: 1, name: "CryptoKing", sym: "BTC", dirLabel: "Long", trades: 23,
      pnl: "+24.20", roi: "+24.2%", pnlColor: "#FFB020", bar: "#FFB020",
    },
    {
      rank: 2, name: "Alpha_X", sym: "ETH", dirLabel: "Long", trades: 18,
      pnl: "+19.80", roi: "+19.8%", pnlColor: "#A4AEC0", bar: "#A4AEC0",
    },
    {
      rank: 3, name: "TraderPro", sym: "SOL", dirLabel: "Short", trades: 31,
      pnl: "+17.40", roi: "+17.4%", pnlColor: "#cd7f32", bar: "#cd7f32",
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />

      {/* View Switcher */}
      <div
        className="flex items-center gap-3.5 px-10"
        style={{ background: "rgba(12,19,32,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[10.5px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Layout</span>
        <div className="flex gap-px" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["boardA", "boardB"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-all"
              style={{
                background: view === v ? "rgba(22,119,255,0.15)" : "transparent",
                color: view === v ? "#00C8FF" : "#A4AEC0",
              }}
            >
              {v === "boardA" ? "Classic" : "Showcase"}
            </button>
          ))}
        </div>
      </div>

      {view === "boardB" ? (
        <div className="px-10 py-7 space-y-5">
          {/* Trader of the Round Header */}
          <div
            className="flex items-end justify-between gap-10 pb-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1"
                  style={{ background: "#FF4D67", fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#FFFFFF" }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: "#FFFFFF", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                  LIVE
                </span>
                <span className="text-sm font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>
                  ROUND 12 · {LEADERBOARD_DATA.length} traders
                </span>
              </div>
              <div className="font-black text-7xl tracking-tight uppercase" style={{ color: "#FFFFFF", lineHeight: 0.9 }}>
                Trader of the Round
              </div>
            </div>
            <div className="flex items-stretch glass rounded-xl overflow-hidden shrink-0">
              <div className="px-6 py-3.5" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Prize pool</div>
                <div className="font-black text-4xl font-mono" style={{ color: "#00C8FF", lineHeight: 1.05 }}>10,000</div>
              </div>
              <div className="px-6 py-3.5">
                <div className="text-xs font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Closes in</div>
                <div className="font-black text-3xl font-mono timer-live" style={{ color: "#FFFFFF", lineHeight: 1.15 }}>47:32</div>
              </div>
            </div>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-4">
            {podium.map((p) => (
              <div
                key={p.rank}
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  background: "rgba(12,19,32,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: `4px solid ${p.bar}`,
                }}
              >
                <div
                  className="absolute -top-7 right-2 font-black"
                  style={{ fontSize: "190px", lineHeight: 1, color: "rgba(255,255,255,0.04)" }}
                >
                  {p.rank}
                </div>
                <div className="relative flex items-center gap-2.5 mb-3 text-[13px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>
                  <span className="px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#E5EAF3" }}>
                    {p.sym}
                  </span>
                  <span>{p.dirLabel} · {p.trades} trades</span>
                </div>
                <div className="relative font-bold text-[34px] tracking-wide uppercase truncate" style={{ color: "#FFFFFF" }}>
                  {p.name}
                </div>
                <div className="relative mt-4 flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-black" style={{ color: p.pnlColor }}>{p.pnl}</span>
                  <span className="font-mono text-lg font-medium" style={{ color: p.pnlColor }}>{p.roi}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Board + Sidebar */}
          <div className="grid" style={{ gridTemplateColumns: "1.85fr 1fr", gap: "16px", alignItems: "start" }}>
            {/* Full Leaderboard */}
            <div className="glass rounded-2xl overflow-hidden">
              <div
                className="grid items-center h-11 text-[12px] font-mono tracking-widest uppercase px-4"
                style={{
                  gridTemplateColumns: "90px minmax(0,1fr) 120px 200px 130px 110px",
                  background: "rgba(255,255,255,0.02)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "#A4AEC0",
                }}
              >
                <div className="px-3">Rank</div>
                <div className="px-2">Trader</div>
                <div className="px-2">Book</div>
                <div className="px-2 text-right">Unrealised P&L</div>
                <div className="px-2 text-right">ROI</div>
                <div className="px-3 text-right">Move</div>
              </div>
              {boardRows.map((r) => (
                <div
                  key={r.rank}
                  className="grid items-center h-[58px] px-4"
                  style={{
                    gridTemplateColumns: "90px minmax(0,1fr) 120px 200px 130px 110px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: r.rowBg,
                  }}
                >
                  <div className="px-3 flex items-center gap-2.5">
                    <span className="w-[3px] h-6" style={{ background: r.bar }} />
                    <span className="font-bold text-[30px]" style={{ color: "#FFFFFF" }}>{r.rank}</span>
                  </div>
                  <div className="px-2 font-semibold text-[30px] tracking-wide uppercase truncate" style={{ color: r.isUser ? "#00C8FF" : "#FFFFFF" }}>
                    {r.name}
                  </div>
                  <div className="px-2 font-mono text-sm">
                    <span
                      className="px-1.5 py-1 rounded"
                      style={{ background: "rgba(255,255,255,0.06)", color: r.dirColor }}
                    >
                      {r.book}
                    </span>
                  </div>
                  <div className="px-2 text-right font-mono text-[26px] font-black" style={{ color: r.pnlColor }}>
                    {formatPercentage(r.returnPct)}
                  </div>
                  <div className="px-2 text-right font-mono text-xl" style={{ color: r.pnlColor }}>
                    {formatPercentage(r.returnPct)}
                  </div>
                  <div className="px-3 text-right font-mono text-lg font-medium" style={{ color: r.moveColor }}>
                    {r.move}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 text-[13px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>
                <span>Showing 1–{LEADERBOARD_DATA.length} of {LEADERBOARD_DATA.length}</span>
                <span>Ranked on unrealised + realised P&L</span>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Positioning */}
              <div className="glass rounded-2xl p-5">
                <div className="text-[12px] font-mono tracking-widest uppercase mb-3.5" style={{ color: "#A4AEC0" }}>Positioning</div>
                <div className="flex items-baseline justify-between font-bold text-[34px]" style={{ color: "#FFFFFF" }}>
                  <span style={{ color: "#00D084" }}>{POSITIONING.longPct}</span>
                  <span className="font-mono text-xs tracking-widest" style={{ color: "#A4AEC0" }}>L / S</span>
                  <span style={{ color: "#FF4D67" }}>{POSITIONING.shortPct}</span>
                </div>
                <div className="flex h-3 mt-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,77,103,0.3)" }}>
                  <div className="h-full rounded-full" style={{ width: POSITIONING.longWidth, background: "linear-gradient(90deg, #00D084, #00a866)" }} />
                </div>
                <div className="flex flex-col gap-2.5 mt-4">
                  {POSITIONING.symbols.map((s) => (
                    <div key={s.k} className="flex items-center gap-3">
                      <span className="w-12 font-mono text-sm" style={{ color: "#C8D0DC" }}>{s.k}</span>
                      <span className="flex-1 flex h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,77,103,0.2)" }}>
                        <span className="h-full rounded-full" style={{ width: s.longWidth, background: "linear-gradient(90deg, #00D084, #00a866)" }} />
                      </span>
                      <span className="w-11 text-right font-mono text-sm" style={{ color: "#B8C0CC" }}>{s.longPct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade Log */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-[12px] font-mono tracking-widest uppercase" style={{ color: "#A4AEC0" }}>Trade log</span>
                  <span className="text-sm font-mono" style={{ color: "#00C8FF" }}>{TRADE_LOG_ENTRIES.length}</span>
                </div>
                {TRADE_LOG_ENTRIES.map((l, i) => (
                  <div
                    key={i}
                    className="grid items-center h-10 px-5 font-mono text-[13px]"
                    style={{
                      gridTemplateColumns: "74px 1fr auto",
                      gap: "10px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <span style={{ color: "#A4AEC0" }}>{l.time}</span>
                    <span className="truncate" style={{ color: "#E5EAF3" }}>{l.name}</span>
                    <span className="tracking-wider" style={{ color: l.color }}>{l.action} {l.sym}</span>
                  </div>
                ))}
              </div>

              {/* Stats Tiles */}
              <div className="grid grid-cols-2 gap-px glass rounded-2xl overflow-hidden">
                {MARKETS.slice(0, 4).map((m) => (
                  <div key={m.symbol} className="p-4 flex items-baseline justify-between gap-4" style={{ background: "rgba(12,19,32,0.6)" }}>
                    <div>
                      <div className="font-bold text-[22px] tracking-wider uppercase" style={{ color: "#FFFFFF" }}>{m.symbol}</div>
                      <div className="text-[11px] font-mono tracking-widest" style={{ color: "#A4AEC0" }}>{m.pair}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-2xl font-black" style={{ color: m.change24h >= 0 ? "#00D084" : "#FF4D67" }}>
                        {m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm font-mono" style={{ color: m.change24h >= 0 ? "#00D084" : "#FF4D67" }}>
                        {m.change24h >= 0 ? "+" : ""}{m.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Classic View */
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-black text-3xl mb-1" style={{ color: "#FFFFFF" }}>LIVE LEADERBOARD</h1>
              <p className="text-sm" style={{ color: "#A4AEC0" }}>Updated in real-time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-xs font-semibold" style={{ color: "#FF4D67" }}>LIVE</span>
            </div>
          </div>

          <select
            className="input-field w-full px-4 py-3 rounded-xl text-sm mb-6"
            value={comp}
            onChange={(e) => setComp(e.target.value)}
            aria-label="Select competition"
          >
            {COMPETITIONS.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {LEADERBOARD_DATA.slice(0, 3).map((row, i) => (
              <div
                key={row.rank}
                className={`rounded-2xl p-4 text-center ${["podium-1", "podium-2", "podium-3"][i]}`}
              >
                <div className="text-2xl mb-1">{["🥇", "🥈", "🥉"][i]}</div>
                <div className="font-bold text-sm mb-0.5" style={{ color: "#E5EAF3" }}>{row.name}</div>
                <div className="font-black font-mono" style={{ color: "#00D084" }}>{formatPercentage(row.returnPct)}</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-4">
            <div
              className="grid grid-cols-4 text-xs font-semibold mb-2 px-4 pb-2"
              style={{ color: "#A4AEC0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span>RANK</span>
              <span>TRADER</span>
              <span className="text-right">RETURN</span>
              <span className="text-right">PRIZE</span>
            </div>
            {LEADERBOARD_DATA.map((row) => (
              <div
                key={row.rank}
                className={`grid grid-cols-4 items-center px-4 py-3 rounded-xl my-0.5 ${
                  row.isUser ? "your-row" : "hover:bg-white/[0.02]"
                }`}
              >
                <span
                  className="text-sm font-mono font-bold"
                  style={{
                    color:
                      row.rank <= 3
                        ? (["#FFB020", "#A4AEC0", "#cd7f32"] as const)[row.rank - 1]
                        : row.isUser ? "#00C8FF" : "#A4AEC0",
                  }}
                >
                  #{row.rank}
                </span>
                <span className="text-sm font-medium" style={{ color: row.isUser ? "#00C8FF" : "#E5EAF3" }}>
                  {row.name}
                  {row.isUser && (
                    <span className="text-xs ml-1 px-1 py-0.5 rounded" style={{ background: "rgba(0,200,255,0.15)" }}>YOU</span>
                  )}
                </span>
                <span className="text-right text-sm font-mono font-bold" style={{ color: "#00D084" }}>
                  {formatPercentage(row.returnPct)}
                </span>
                <span className="text-right text-xs font-mono" style={{ color: row.prize > 0 ? "#FFB020" : "#A4AEC0" }}>
                  {row.prize > 0 ? `🏆 ${row.prize}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
