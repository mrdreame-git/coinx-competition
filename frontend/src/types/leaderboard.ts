export interface LeaderboardRow {
  rank: number
  name: string
  returnPct: number
  pnl: number
  prize: number
  isUser?: boolean
}

export interface PodiumEntry {
  rank: number
  name: string
  returnPct: string
  prize: string
}
