import type { MarketSymbol } from "./symbols"

/** Normalized 24h rolling stats for one contract, straight from /fapi/v1/ticker/24hr. */
export interface Ticker24h {
  base: string
  symbol: string
  name: string
  pair: string
  /** Last traded price. */
  price: number
  /** Absolute price change over the window. */
  priceChange: number
  /** Percent price change over the window, e.g. 1.24 means +1.24%. */
  changePct: number
  high: number
  low: number
  /** Base-asset volume. */
  volume: number
  /** Quote-asset (USDT) volume. */
  quoteVolume: number
  /** Number of trades in the window. */
  trades: number
  /** Rolling 24h weighted average price. */
  vwap: number
  /** Epoch ms of the ticker snapshot. */
  updatedAt: number
}

export interface Candle {
  /** Open time, epoch ms. */
  t: number
  o: number
  h: number
  l: number
  c: number
  /** Base-asset volume. */
  v: number
  /** Close time, epoch ms. */
  closeTime: number
  /** Quote-asset volume. */
  quoteVolume: number
  /** Trade count. */
  trades: number
  /** Whether this candle is still forming. */
  open: boolean
}

export interface DepthLevel {
  price: number
  qty: number
  /** Cumulative quantity from the top of book to this level. */
  total: number
}

export interface OrderBook {
  bids: DepthLevel[]
  asks: DepthLevel[]
  /** Best ask minus best bid, absolute. */
  spread: number
  /** Spread as a percent of mid price. */
  spreadPct: number
  /** Mid price, or 0 when either side is empty. */
  mid: number
  /** Cumulative bid notional in the fetched window. */
  bidNotional: number
  /** Cumulative ask notional in the fetched window. */
  askNotional: number
}

export interface MarketTrade {
  id: number
  price: number
  qty: number
  /** Epoch ms the trade matched. */
  time: number
  /** Aggressor side. "buy" means the taker lifted the offer. */
  side: "buy" | "sell"
  /** Quote notional of the single fill. */
  notional: number
}

export interface MarkPrice {
  symbol: string
  markPrice: number
  indexPrice: number
  /** Funding rate as a percent, e.g. 0.01 means 0.01%. */
  fundingRatePct: number
  /** Epoch ms of the next funding settlement. */
  nextFundingTime: number
  /** Epoch ms of the snapshot. */
  updatedAt: number
}

export interface FundingPoint {
  /** Epoch ms the funding was charged. */
  time: number
  /** Realized rate as a percent. */
  ratePct: number
  markPrice: number
}

export interface OpenInterest {
  /** Open interest in base-asset contracts. */
  value: number
  /** Epoch ms of the snapshot. */
  time: number
}

export interface SymbolMeta extends MarketSymbol {
  ticker: Ticker24h | null
}

/** Shared shape for the loading/error/empty cycle every market view renders. */
export interface AsyncState {
  loading: boolean
  error: string
}
