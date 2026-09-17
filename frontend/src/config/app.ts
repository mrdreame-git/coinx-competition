export const APP_NAME = "COINX"

export const APP_TAGLINE = "TRADE. COMPETE. WIN."

export const DEMO_CREDENTIALS = {
  email: "demo@coinx.com",
  password: "demo123",
}

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  markets: "/markets",
  marketDetail: (symbol: string) => `/markets/${symbol}`,
  competitions: "/competitions",
  competitionDetail: (id: number | string) => `/competitions/${id}`,
  compLobby: (id: number | string) => `/competitions/${id}/lobby`,
  liveComp: (id: number | string) => `/competitions/${id}/trade`,
  results: (id: number | string) => `/competitions/${id}/results`,
  wallet: "/wallet",
  leaderboard: "/leaderboard",
  notifications: "/notifications",
  profile: "/profile",
} as const
