import type { LeaderboardRow, PodiumEntry } from "@/types/leaderboard"

export const LEADERBOARD_DATA: LeaderboardRow[] = [
  { rank: 1, name: "CryptoKing", returnPct: 24.2, pnl: 24.2, prize: 2000 },
  { rank: 2, name: "Alpha_X", returnPct: 19.8, pnl: 19.8, prize: 1500 },
  { rank: 3, name: "TraderPro", returnPct: 17.4, pnl: 17.4, prize: 1000 },
  { rank: 4, name: "BullRunner", returnPct: 15.9, pnl: 15.9, prize: 500 },
  { rank: 5, name: "SatoshiV", returnPct: 14.3, pnl: 14.3, prize: 400 },
  { rank: 6, name: "NightOwl", returnPct: 13.1, pnl: 13.1, prize: 300 },
  { rank: 7, name: "MoonShot", returnPct: 11.8, pnl: 11.8, prize: 200 },
  { rank: 8, name: "DigitalApe", returnPct: 10.5, pnl: 10.5, prize: 100 },
  { rank: 9, name: "WaveRider", returnPct: 9.8, pnl: 9.8, prize: 0 },
  { rank: 10, name: "CoinMaster", returnPct: 9.4, pnl: 9.4, prize: 0 },
  { rank: 11, name: "DeltaForce", returnPct: 9.15, pnl: 9.15, prize: 0 },
  { rank: 12, name: "YOU", returnPct: 8.42, pnl: 8.42, prize: 0, isUser: true },
  { rank: 13, name: "ColdBlood", returnPct: 8.12, pnl: 8.12, prize: 0 },
  { rank: 14, name: "FastFingers", returnPct: 7.8, pnl: 7.8, prize: 0 },
  { rank: 15, name: "ZeroFear", returnPct: 7.1, pnl: 7.1, prize: 0 },
]

export const PODIUM_RESULTS: PodiumEntry[] = [
  { rank: 2, name: "Alpha_X", returnPct: "+47.83%", prize: "1,500 USDT" },
  { rank: 1, name: "CryptoKing", returnPct: "+54.21%", prize: "2,000 USDT" },
  { rank: 3, name: "TraderX", returnPct: "+41.20%", prize: "1,000 USDT" },
]

export const LOBBY_TRADERS = [
  "CryptoKing",
  "Alpha_X",
  "TraderPro",
  "BullRunner",
  "SatoshiV",
  "NightOwl",
  "YOU",
]
