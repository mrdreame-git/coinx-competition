"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import StatusBadge from "@/components/common/StatusBadge"
import { COMPETITIONS } from "@/mocks/competitions"
import { TRANSACTIONS } from "@/mocks/wallet"
import { MARKETS } from "@/mocks/markets"
import { useAuth } from "@/features/auth/auth-context"

const DASHBOARD_STATS = [
  { label: "COMPETITIONS WON", value: "7", sub: "All-time" },
  { label: "BEST RETURN", value: "+54.2%", sub: "BTC Challenge" },
  { label: "TOTAL PRIZES", value: "$8,420", sub: "Earned" },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="text-sm mb-1" style={{ color: "#A4AEC0" }}>Welcome back,</div>
          <h1 className="font-black text-3xl" style={{ color: "#FFFFFF" }}>
            {user.name}{" "}
            <span className="text-base font-normal" style={{ color: "#A4AEC0" }}>👋</span>
          </h1>
        </div>

        {/* Balance + Stats */}
        <div className="grid lg:grid-cols-4 gap-5 mb-8">
          <div className="lg:col-span-2 glass-blue rounded-2xl p-6 glow-blue">
            <div className="text-xs font-semibold mb-1" style={{ color: "#A4AEC0" }}>TOTAL BALANCE</div>
            <div className="font-black text-4xl font-mono mb-1" style={{ color: "#FFFFFF" }}>1,250.00</div>
            <div className="text-base font-mono mb-6" style={{ color: "#A4AEC0" }}>USDT</div>
            <div className="flex gap-3">
              <button onClick={() => router.push(ROUTES.wallet)} className="btn-primary px-5 py-2.5 rounded-xl text-sm">
                DEPOSIT
              </button>
              <button onClick={() => router.push(ROUTES.wallet)} className="btn-ghost px-5 py-2.5 rounded-xl text-sm">
                WITHDRAW
              </button>
            </div>
          </div>
          {DASHBOARD_STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold mb-1" style={{ color: "#A4AEC0" }}>{s.label}</div>
              <div className="font-black text-2xl font-mono mb-0.5 gradient-text-blue">{s.value}</div>
              <div className="text-xs" style={{ color: "#A4AEC0" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Market Ticker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: "#FFFFFF" }}>MARKET OVERVIEW</h2>
            <button onClick={() => router.push(ROUTES.markets)} className="text-xs" style={{ color: "#00C8FF" }}>
              View all markets →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MARKETS.slice(0, 4).map((m) => (
              <div
                key={m.symbol}
                onClick={() => router.push(ROUTES.marketDetail(m.symbol))}
                className="glass rounded-xl p-4 cursor-pointer card-hover"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-lg tracking-wide uppercase" style={{ color: "#FFFFFF" }}>{m.symbol}</span>
                  <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A4AEC0" }}>
                    PERP
                  </span>
                </div>
                <div className="font-mono text-xl font-black mb-1" style={{ color: m.change24h >= 0 ? "#00D084" : "#FF4D67" }}>
                  {m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono" style={{ color: m.change24h >= 0 ? "#00D084" : "#FF4D67" }}>
                    {m.change24h >= 0 ? "+" : ""}{m.change24h.toFixed(2)}%
                  </span>
                  <div className="flex items-end gap-0.5" style={{ height: "16px" }}>
                    {m.sparkline.slice(-5).map((v, i) => {
                      const max = Math.max(...m.sparkline.slice(-5))
                      const min = Math.min(...m.sparkline.slice(-5))
                      const h = max === min ? 8 : ((v - min) / (max - min)) * 16
                      return (
                        <span
                          key={i}
                          className="w-1 rounded-t-sm"
                          style={{
                            height: `${Math.max(3, h)}px`,
                            background: m.change24h >= 0 ? "#00D084" : "#FF4D67",
                            opacity: 0.6,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Competitions */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4" style={{ color: "#FFFFFF" }}>MY COMPETITIONS</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div
              className="glass rounded-2xl p-5 card-hover cursor-pointer"
              style={{ border: "1px solid rgba(255,77,103,0.25)" }}
              onClick={() => router.push(ROUTES.liveComp(1))}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-mono mb-0.5" style={{ color: "#A4AEC0" }}>BTC/USDT</div>
                  <div className="font-bold" style={{ color: "#E5EAF3" }}>BTC 60 MIN CHALLENGE</div>
                </div>
                <StatusBadge status="live" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>RANK</div>
                  <div className="font-bold font-mono text-lg" style={{ color: "#00C8FF" }}>#12</div>
                  <div className="text-xs font-mono" style={{ color: "#A4AEC0" }}>/ 284</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>RETURN</div>
                  <div className="font-bold font-mono text-lg" style={{ color: "#00D084" }}>+8.42%</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>TIME LEFT</div>
                  <div className="font-bold font-mono text-lg timer-live" style={{ color: "#00C8FF" }}>47:32</div>
                </div>
              </div>
              <button onClick={() => router.push(ROUTES.liveComp(1))} className="btn-danger w-full py-2.5 rounded-xl text-sm">
                ENTER COMPETITION
              </button>
            </div>

            <div
              className="glass rounded-2xl p-5 card-hover cursor-pointer"
              onClick={() => router.push(ROUTES.compLobby(3))}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-mono mb-0.5" style={{ color: "#A4AEC0" }}>SOL/USDT</div>
                  <div className="font-bold" style={{ color: "#E5EAF3" }}>SOL 30 MIN SPRINT</div>
                </div>
                <StatusBadge status="upcoming" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>STARTS IN</div>
                  <div className="font-bold font-mono text-lg" style={{ color: "#00C8FF" }}>01:44:20</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>PRIZE POOL</div>
                  <div className="font-bold font-mono text-lg gradient-text">2,500</div>
                  <div className="text-xs" style={{ color: "#A4AEC0" }}>USDT</div>
                </div>
              </div>
              <button onClick={() => router.push(ROUTES.compLobby(3))} className="btn-ghost w-full py-2.5 rounded-xl text-sm">
                VIEW LOBBY
              </button>
            </div>

            <div
              className="glass rounded-2xl p-5 card-hover cursor-pointer opacity-70"
              onClick={() => router.push(ROUTES.results(5))}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-mono mb-0.5" style={{ color: "#A4AEC0" }}>BNB/USDT</div>
                  <div className="font-bold" style={{ color: "#E5EAF3" }}>BNB LIGHTNING CUP</div>
                </div>
                <StatusBadge status="finished" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>FINAL RANK</div>
                  <div className="font-bold font-mono text-lg" style={{ color: "#FFB020" }}>#7</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>RETURN</div>
                  <div className="font-bold font-mono text-lg" style={{ color: "#00D084" }}>+31.4%</div>
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>PRIZE</div>
                  <div className="font-bold font-mono text-lg" style={{ color: "#FFB020" }}>500</div>
                </div>
              </div>
              <button onClick={() => router.push(ROUTES.results(5))} className="btn-ghost w-full py-2.5 rounded-xl text-sm">
                VIEW RESULTS
              </button>
            </div>
          </div>
        </div>

        {/* Available Competitions + Activity */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ color: "#FFFFFF" }}>AVAILABLE COMPETITIONS</h2>
              <button onClick={() => router.push(ROUTES.competitions)} className="text-xs" style={{ color: "#00C8FF" }}>
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {COMPETITIONS.filter((c) => c.status !== "finished")
                .slice(0, 3)
                .map((c) => (
                  <div
                    key={c.id}
                    className="glass rounded-xl p-4 flex items-center gap-4 card-hover cursor-pointer"
                    onClick={() => router.push(ROUTES.competitionDetail(c.id))}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate" style={{ color: "#E5EAF3" }}>{c.name}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: "#A4AEC0" }}>
                        {c.pair} · {c.duration}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-sm gradient-text">{c.prize.toLocaleString()} USDT</div>
                      <div className="text-xs font-mono" style={{ color: "#A4AEC0" }}>Prize Pool</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm" style={{ color: "#E5EAF3" }}>{c.entry} USDT</div>
                      <div className="text-xs" style={{ color: "#A4AEC0" }}>Entry</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-lg mb-4" style={{ color: "#FFFFFF" }}>RECENT ACTIVITY</h2>
            <div className="glass rounded-2xl p-4 space-y-3">
              {TRANSACTIONS.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: tx.positive ? "rgba(0,208,132,0.1)" : "rgba(255,77,103,0.1)" }}
                  >
                    <span className="text-xs">{tx.positive ? "↑" : "↓"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: "#E5EAF3" }}>{tx.label}</div>
                    <div className="text-xs" style={{ color: "#A4AEC0" }}>{tx.time}</div>
                  </div>
                  <div className="font-mono text-sm font-semibold" style={{ color: tx.positive ? "#00D084" : "#FF4D67" }}>
                    {tx.positive ? "+" : ""}{tx.amount} USDT
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
