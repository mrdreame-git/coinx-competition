"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import Orbs from "@/components/common/Orbs"
import StatusBadge from "@/components/common/StatusBadge"
import {
  COMPETITIONS,
  PRIZE_TIERS,
  COMPETITION_RULES,
} from "@/mocks/competitions"
import { competitionService } from "@/features/competitions/services/competition.service"

interface JoinModalProps {
  name: string
  entry: number
  onCancel: () => void
  onConfirm: () => void
}

function JoinModal({ name, entry, onCancel, onConfirm }: JoinModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="glass rounded-2xl p-8 w-full max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm join"
      >
        <h3 className="font-black text-xl mb-6" style={{ color: "#FFFFFF" }}>
          JOIN {name}?
        </h3>
        <div className="space-y-3 mb-8">
          {[
            ["Entry fee", `${entry} USDT`],
            ["Your balance", "1,250 USDT"],
            ["Balance after joining", `${1250 - entry} USDT`],
          ].map(([l, v]) => (
            <div
              key={l}
              className="flex justify-between py-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-sm" style={{ color: "#A4AEC0" }}>
                {l}
              </span>
              <span
                className="text-sm font-mono font-semibold"
                style={{
                  color: l === "Balance after joining" ? "#FFB020" : "#E5EAF3",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1 py-3 rounded-xl text-sm"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="btn-success flex-1 py-3 rounded-xl text-sm"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CompetitionDetailPage() {
  const router = useRouter()
  const { competitionId } = useParams<{ competitionId: string }>()
  const comp =
    COMPETITIONS.find((c) => c.id === Number(competitionId)) ?? COMPETITIONS[0]
  const [showModal, setShowModal] = useState(false)
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)

  const handleConfirm = async () => {
    setJoining(true)
    await competitionService.joinCompetition(comp.id)
    setJoining(false)
    setShowModal(false)
    setJoined(true)
  }

  if (joined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080D18" }}
      >
        <Orbs />
        <div className="relative z-10 text-center max-w-md glass rounded-2xl p-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(0,208,132,0.15)",
              border: "2px solid rgba(0,208,132,0.4)",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D084"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div
            className="text-xs font-semibold mb-2"
            style={{ color: "#00D084" }}
          >
            SUCCESS
          </div>
          <h2 className="font-black text-3xl mb-2" style={{ color: "#FFFFFF" }}>
            YOU'RE REGISTERED!
          </h2>
          <p className="mb-2" style={{ color: "#A4AEC0" }}>
            Competition starts in:
          </p>
          <div className="font-black text-5xl font-mono mb-8 timer-live gradient-text">
            00:08:31
          </div>
          <button
            onClick={() => router.push(ROUTES.compLobby(comp.id))}
            className="btn-cyan w-full py-3.5 rounded-xl font-bold"
          >
            VIEW LOBBY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />
      {showModal && (
        <JoinModal
          name={comp.name}
          entry={comp.entry}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href={ROUTES.competitions}
          className="flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: "#A4AEC0" }}
        >
          <span>←</span> Back to Competitions
        </Link>
        <div className="flex items-start justify-between mb-8">
          <div>
            <div
              className="text-xs font-mono mb-1"
              style={{ color: "#A4AEC0" }}
            >
              {comp.pair}
            </div>
            <h1 className="font-black text-3xl" style={{ color: "#FFFFFF" }}>
              {comp.name}
            </h1>
          </div>
          <StatusBadge status={comp.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "ENTRY FEE",
              value: `${comp.entry} USDT`,
              color: "#E5EAF3",
            },
            {
              label: "PRIZE POOL",
              value: `${comp.prize.toLocaleString()} USDT`,
              color: "#6D4AFF",
              gradient: true,
            },
            {
              label: "PARTICIPANTS",
              value: `${comp.players} / ${comp.maxPlayers}`,
              color: "#00C8FF",
            },
            {
              label: "STARTS IN",
              value: comp.status === "live" ? "LIVE" : comp.startsIn,
              color: "#FFB020",
            },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: "#A4AEC0" }}
              >
                {s.label}
              </div>
              <div
                className={`font-black text-xl font-mono ${
                  s.gradient ? "gradient-text" : ""
                }`}
                style={s.gradient ? {} : { color: s.color }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3
              className="font-bold text-base mb-4"
              style={{ color: "#FFFFFF" }}
            >
              COMPETITION RULES
            </h3>
            <div className="space-y-3">
              {COMPETITION_RULES.map((rule) => (
                <div
                  key={rule.label}
                  className="flex justify-between py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span className="text-sm" style={{ color: "#A4AEC0" }}>
                    {rule.label}
                  </span>
                  <span
                    className="text-sm font-mono font-semibold"
                    style={{ color: "#E5EAF3" }}
                  >
                    {rule.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3
              className="font-bold text-base mb-4"
              style={{ color: "#FFFFFF" }}
            >
              PRIZE DISTRIBUTION
            </h3>
            <div className="space-y-2">
              {PRIZE_TIERS.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                    i < 3 ? ["podium-1", "podium-2", "podium-3"][i] : ""
                  }`}
                >
                  <span
                    className="w-8 text-sm font-bold font-mono"
                    style={{
                      color:
                        i === 0
                          ? "#FFB020"
                          : i === 1
                            ? "#A4AEC0"
                            : i === 2
                              ? "#cd7f32"
                              : "#A4AEC0",
                    }}
                  >
                    #{p.rank}
                  </span>
                  <span className="flex-1 text-sm font-mono font-bold gradient-text">
                    {p.prize.toLocaleString()} USDT
                  </span>
                  <span className="text-xs" style={{ color: "#A4AEC0" }}>
                    {p.pct}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setShowModal(true)}
            disabled={comp.status === "finished"}
            className="btn-cyan text-base px-12 py-4 rounded-xl font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            JOIN COMPETITION
          </button>
          {joining && (
            <p className="mt-3 text-sm" style={{ color: "#A4AEC0" }}>
              Joining...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
