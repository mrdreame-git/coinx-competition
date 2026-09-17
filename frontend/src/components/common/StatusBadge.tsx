import type { CompetitionStatus } from "@/types/competition"

interface StatusBadgeProps {
  status: CompetitionStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "live") {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "rgba(255,77,103,0.12)",
          color: "#FF4D67",
          border: "1px solid rgba(255,77,103,0.25)",
        }}
      >
        <div className="live-dot" />
        LIVE
      </div>
    )
  }
  if (status === "upcoming") {
    return (
      <div
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "rgba(22,119,255,0.12)",
          color: "#00C8FF",
          border: "1px solid rgba(0,200,255,0.2)",
        }}
      >
        UPCOMING
      </div>
    )
  }
  return (
    <div
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: "rgba(164,174,192,0.08)",
        color: "#A4AEC0",
        border: "1px solid rgba(164,174,192,0.15)",
      }}
    >
      FINISHED
    </div>
  )
}
