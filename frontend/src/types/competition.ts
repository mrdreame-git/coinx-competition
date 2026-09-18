export type CompetitionStatus = "upcoming" | "live" | "finished"

export interface Competition {
  id: number
  name: string
  pair: string
  entry: number
  prize: number
  players: number
  maxPlayers: number
  duration: string
  status: CompetitionStatus
  startsIn: string
  startTime: string
}

export interface PrizeTier {
  rank: number | string
  prize: number
  pct: string
}

export interface CompetitionRule {
  label: string
  value: string
}
