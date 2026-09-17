"use client"

import { useRouter } from "next/navigation"
import type { Competition } from "@/types/competition"
import { ROUTES } from "@/config/app"
import StatusBadge from "@/components/common/StatusBadge"

interface CompetitionCardProps {
  comp: Competition
}

export default function CompetitionCard({ comp }: CompetitionCardProps) {
  const router = useRouter()
  const fill = Math.round((comp.players / comp.maxPlayers) * 100)
  const onClick = () => router.push(ROUTES.competitionDetail(comp.id))

  return (
    <div
      className="glass rounded-2xl p-5 card-hover cursor-pointer"
      style={{
        borderColor:
          comp.status === "live"
            ? "rgba(255,77,103,0.2)"
            : "rgba(255,255,255,0.06)",
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs font-mono" style={{ color: "#A4AEC0" }}>
            {comp.pair}
          </div>
          <div
            className="font-bold text-lg mt-0.5 leading-tight"
            style={{ color: "#E5EAF3" }}
          >
            {comp.name}
          </div>
        </div>
        <StatusBadge status={comp.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(109,74,255,0.08)",
            border: "1px solid rgba(109,74,255,0.15)",
          }}
        >
          <div
            className="text-xs font-medium mb-1"
            style={{ color: "#A4AEC0" }}
          >
            PRIZE POOL
          </div>
          <div className="font-bold font-mono text-xl gradient-text">
            {comp.prize.toLocaleString()} <span className="text-xs">USDT</span>
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="text-xs font-medium mb-1"
            style={{ color: "#A4AEC0" }}
          >
            ENTRY FEE
          </div>
          <div
            className="font-bold font-mono text-xl"
            style={{ color: "#E5EAF3" }}
          >
            {comp.entry} <span className="text-xs text-gray-400">USDT</span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "#A4AEC0" }}>PLAYERS</span>
          <span className="font-mono" style={{ color: "#E5EAF3" }}>
            {comp.players.toLocaleString()} / {comp.maxPlayers.toLocaleString()}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${fill}%`,
              background:
                fill > 90
                  ? "linear-gradient(90deg, #FF4D67, #ff7a8a)"
                  : "linear-gradient(90deg, #1677FF, #00C8FF)",
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div
          className="text-xs font-mono"
          style={{ color: comp.status === "live" ? "#FF4D67" : "#A4AEC0" }}
        >
          {comp.status === "live"
            ? "⏱ LIVE NOW"
            : comp.status === "finished"
              ? "ENDED"
              : `STARTS IN ${comp.startsIn}`}
        </div>
        <button
          className="btn-primary text-xs px-4 py-2 rounded-lg"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {comp.status === "finished" ? "VIEW RESULTS" : "VIEW"}
        </button>
      </div>
    </div>
  )
}
