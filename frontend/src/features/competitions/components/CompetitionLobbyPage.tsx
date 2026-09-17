"use client"

import { useRouter, useParams } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import { useCountdown } from "@/hooks/use-countdown"
import { COMPETITIONS } from "@/mocks/competitions"
import { LOBBY_TRADERS } from "@/mocks/leaderboard"

export default function CompetitionLobbyPage() {
  const router = useRouter()
  const { competitionId } = useParams<{ competitionId: string }>()
  const comp =
    COMPETITIONS.find((c) => c.id === Number(competitionId)) ?? COMPETITIONS[0]
  const { formatted: timer } = useCountdown({
    durationSeconds: 2 * 60 + 17,
    onComplete: () => router.push(ROUTES.liveComp(comp.id))
  })

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(22,119,255,0.08)",
              border: "1px solid rgba(0,200,255,0.2)",
              color: "#00C8FF",
            }}
          >
            COMPETITION LOBBY
          </div>
          <h1 className="font-black text-3xl mb-2" style={{ color: "#FFFFFF" }}>
            {comp.name}
          </h1>
          <p className="text-sm" style={{ color: "#A4AEC0" }}>
            Trading opens automatically when the competition starts.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 text-center mb-6 glow-blue">
          <div
            className="text-sm font-semibold mb-2"
            style={{ color: "#A4AEC0" }}
          >
            STARTS IN
          </div>
          <div className="font-black text-7xl font-mono mb-1 timer-pulse gradient-text">
            {timer}
          </div>
          <div className="text-xs" style={{ color: "#A4AEC0" }}>
            WAITING FOR COMPETITION TO START
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "PARTICIPANTS", value: `284 / ${comp.maxPlayers}` },
            { label: "YOUR STARTING CAPITAL", value: `${comp.entry} USDT` },
            { label: "YOUR RANK", value: "--" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <div className="text-xs mb-1" style={{ color: "#A4AEC0" }}>
                {s.label}
              </div>
              <div
                className="font-bold font-mono text-xl"
                style={{ color: "#E5EAF3" }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4" style={{ color: "#A4AEC0" }}>
            REGISTERED TRADERS
          </h3>
          <div className="space-y-2">
            {LOBBY_TRADERS.map((name, i) => (
              <div
                key={name}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                  name === "YOU" ? "your-row" : "hover:bg-white/[0.02]"
                }`}
              >
                <div
                  className="w-6 text-xs font-mono text-center"
                  style={{ color: "#A4AEC0" }}
                >
                  {i + 1}
                </div>
                <div
                  className="flex-1 text-sm font-medium"
                  style={{ color: name === "YOU" ? "#00C8FF" : "#E5EAF3" }}
                >
                  {name}{" "}
                  {name === "YOU" && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(0,200,255,0.15)",
                        color: "#00C8FF",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono" style={{ color: "#A4AEC0" }}>
                  Ready
                </div>
              </div>
            ))}
            <div
              className="text-xs text-center pt-2"
              style={{ color: "#A4AEC0" }}
            >
              + 277 more traders
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push(ROUTES.liveComp(comp.id))}
            className="btn-primary px-8 py-3.5 rounded-xl font-bold"
          >
            ENTER COMPETITION →
          </button>
        </div>
      </div>
    </div>
  )
}
