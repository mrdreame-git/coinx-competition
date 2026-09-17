import type { LeaderboardRow } from "@/types/leaderboard"
import { formatPercentage } from "@/lib/format"

interface LeaderboardTableProps {
  data: LeaderboardRow[]
  compact?: boolean
}

export default function LeaderboardTable({
  data,
  compact = false,
}: LeaderboardTableProps) {
  return (
    <div className="space-y-1">
      {data.map((row) => (
        <div
          key={row.rank}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
            row.isUser ? "your-row" : "hover:bg-white/[0.02]"
          }`}
        >
          <div className="w-8 text-center">
            {row.rank <= 3 ? (
              <span
                className="text-sm font-bold font-mono"
                style={{
                  color:
                    row.rank === 1
                      ? "#FFB020"
                      : row.rank === 2
                        ? "#A4AEC0"
                        : "#cd7f32",
                }}
              >
                #{row.rank}
              </span>
            ) : (
              <span
                className="text-sm font-mono"
                style={{ color: row.isUser ? "#00C8FF" : "#A4AEC0" }}
              >
                #{row.rank}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm font-medium ${row.isUser ? "font-bold" : ""}`}
              style={{ color: row.isUser ? "#00C8FF" : "#E5EAF3" }}
            >
              {row.name}
              {row.isUser && (
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(0,200,255,0.15)",
                    color: "#00C8FF",
                  }}
                >
                  YOU
                </span>
              )}
            </span>
          </div>
          <div className="text-right">
            <div
              className="font-bold font-mono text-sm"
              style={{ color: "#00D084" }}
            >
              {formatPercentage(row.returnPct)}
            </div>
            {!compact && row.prize > 0 && (
              <div className="text-xs font-mono" style={{ color: "#FFB020" }}>
                🏆 {row.prize} USDT
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
