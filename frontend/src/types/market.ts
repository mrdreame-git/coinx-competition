export interface Market {
  symbol: string
  pair: string
  name: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: string
  openInterest: string
  sparkline: number[]
  category: "perp" | "spot"
}

export interface OrderBookEntry {
  price: number
  qty: number
  total: number
}

export interface TapeEntry {
  price: number
  qty: number
  time: string
  side: "buy" | "sell"
}

export interface DepthBar {
  height: string
}

export interface MarketStat {
  label: string
  value: string
}

export interface FundingRate {
  time: string
  rate: string
  predicted: string
}

export interface OpenInterestPoint {
  time: string
  value: string
  change: string
}

export interface MarkPrice {
  symbol: string
  markPrice: string
  indexPrice: string
  fundingRate: string
  nextFunding: string
}

export interface Position {
  symbol: string
  side: "Long" | "Short"
  leverage: string
  qty: string
  entry: string
  mark: string
  liq: string
  pnl: number
  pnlColor: string
  margin: number
  marginRatio: number
}

export interface OpenOrder {
  time: string
  symbol: string
  side: "Buy" | "Sell"
  type: string
  price: string
  qty: string
}

export interface FilledOrder {
  time: string
  symbol: string
  side: "Buy" | "Sell"
  type: string
  price: string
  qty: string
  status: "Filled" | "Cancelled"
}
