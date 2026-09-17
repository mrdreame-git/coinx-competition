"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import Orbs from "@/components/common/Orbs"
import LeaderboardTable from "@/components/common/LeaderboardTable"
import { PODIUM_RESULTS, LEADERBOARD_DATA } from "@/mocks/leaderboard"

export default function CompetitionResultsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Orbs variant="results" />
      <Header />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <div
            className="text-xs font-semibold mb-2"
            style={{ color: "#A4AEC0" }}
          >
            BTC 60 MIN CHALLENGE
          </div>
          <h1 className="font-black text-4xl mb-1" style={{ color: "#FFFFFF" }}>
            FINAL RESULTS
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {PODIUM_RESULTS.map((p, i) => (
            <div
              key={p.rank}
              className={`rounded-2xl p-6 text-center ${["podium-2", "podium-1", "podium-3"][i]}`}
              style={{ marginTop: p.rank === 1 ? 0 : 24 }}
            >
              <div className="text-3xl mb-2">
                {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}
              </div>
              <div
                className="font-black text-3xl font-mono mb-1"
                style={{
                  color:
                    p.rank === 1
                      ? "#FFB020"
                      : p.rank === 2
                        ? "#A4AEC0"
                        : "#cd7f32",
                }}
              >
                #{p.rank}
              </div>
              <div className="font-bold mb-1" style={{ color: "#E5EAF3" }}>
                {p.name}
              </div>
              <div
                className="font-mono font-bold text-lg mb-1"
                style={{ color: "#00D084" }}
              >
                {p.returnPct}
              </div>
              <div
                className="font-mono text-sm"
                style={{ color: p.rank === 1 ? "#FFB020" : "#A4AEC0" }}
              >
                {p.prize}
              </div>
            </div>
          ))}
        </div>

        <div className="your-row rounded-2xl p-6 mb-8 glow-blue">
          <div className="flex items-center gap-4">
            <div className="font-black text-5xl font-mono gradient-text-blue">
              #7
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg" style={{ color: "#FFFFFF" }}>
                YOU{" "}
                <span
                  className="text-xs px-1.5 py-0.5 rounded ml-1"
                  style={{
                    background: "rgba(0,200,255,0.15)",
                    color: "#00C8FF",
                  }}
                >
                  YOU
                </span>
              </div>
              <div className="text-sm font-mono" style={{ color: "#00D084" }}>
                +31.42% return
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs mb-0.5" style={{ color: "#A4AEC0" }}>
                PRIZE CREDITED
              </div>
              <div
                className="font-black text-2xl font-mono"
                style={{ color: "#FFB020" }}
              >
                +500 USDT
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 mb-8">
          <h3
            className="text-xs font-semibold mb-4"
            style={{ color: "#A4AEC0" }}
          >
            FULL LEADERBOARD
          </h3>
          <LeaderboardTable data={LEADERBOARD_DATA.slice(0, 10)} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push(ROUTES.wallet)}
            className="btn-ghost flex-1 py-3.5 rounded-xl font-semibold"
          >
            VIEW WALLET
          </button>
          <button
            onClick={() => router.push(ROUTES.competitions)}
            className="btn-cyan flex-1 py-3.5 rounded-xl font-bold"
          >
            JOIN NEXT COMPETITION
          </button>
        </div>
      </div>
    </div>
  )
}
