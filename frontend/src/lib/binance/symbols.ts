/**
 * The tradable universe. Every market price shown anywhere in the app is pulled
 * from Binance's public REST + WebSocket feeds for these symbols, so this list is
 * the single place that decides what "the market" means for COINX.
 *
 * Every entry is deliberately listed on BOTH Binance spot and USD-M futures with
 * an identical symbol, so falling back between the two feeds never changes the
 * meaning of an instrument. That rules out futures-only contracts such as
 * `1000PEPEUSDT` (spot quotes plain `PEPEUSDT`, at a thousandth of the price) and
 * spot-only names such as `TONUSDT`, which futures delisted. `NEAR` and `AAVE`
 * stand in for those two. Verified against both `exchangeInfo` endpoints.
 */
export interface MarketSymbol {
  /** Base asset, used as the route segment: /markets/BTC */
  base: string
  /** Binance symbol, identical on spot and futures: BTCUSDT */
  symbol: string
  /** Display pair: BTC / USDT */
  pair: string
  /** Long form name shown beside the ticker. */
  name: string
  /** Quote asset for the contract. */
  quote: string
}

export const QUOTE = "USDT"

export const MARKET_SYMBOLS: MarketSymbol[] = [
  { base: "BTC", symbol: "BTCUSDT", pair: "BTC / USDT", name: "Bitcoin", quote: QUOTE },
  { base: "ETH", symbol: "ETHUSDT", pair: "ETH / USDT", name: "Ethereum", quote: QUOTE },
  { base: "SOL", symbol: "SOLUSDT", pair: "SOL / USDT", name: "Solana", quote: QUOTE },
  { base: "BNB", symbol: "BNBUSDT", pair: "BNB / USDT", name: "BNB", quote: QUOTE },
  { base: "XRP", symbol: "XRPUSDT", pair: "XRP / USDT", name: "XRP", quote: QUOTE },
  { base: "DOGE", symbol: "DOGEUSDT", pair: "DOGE / USDT", name: "Dogecoin", quote: QUOTE },
  { base: "ADA", symbol: "ADAUSDT", pair: "ADA / USDT", name: "Cardano", quote: QUOTE },
  { base: "AVAX", symbol: "AVAXUSDT", pair: "AVAX / USDT", name: "Avalanche", quote: QUOTE },
  { base: "LINK", symbol: "LINKUSDT", pair: "LINK / USDT", name: "Chainlink", quote: QUOTE },
  { base: "DOT", symbol: "DOTUSDT", pair: "DOT / USDT", name: "Polkadot", quote: QUOTE },
  { base: "LTC", symbol: "LTCUSDT", pair: "LTC / USDT", name: "Litecoin", quote: QUOTE },
  { base: "NEAR", symbol: "NEARUSDT", pair: "NEAR / USDT", name: "NEAR Protocol", quote: QUOTE },
  { base: "SUI", symbol: "SUIUSDT", pair: "SUI / USDT", name: "Sui", quote: QUOTE },
  { base: "AAVE", symbol: "AAVEUSDT", pair: "AAVE / USDT", name: "Aave", quote: QUOTE },
  { base: "ARB", symbol: "ARBUSDT", pair: "ARB / USDT", name: "Arbitrum", quote: QUOTE },
  { base: "OP", symbol: "OPUSDT", pair: "OP / USDT", name: "Optimism", quote: QUOTE },
]

/** Symbols that anchor the app: hero ticker, dashboard strip, competition pairs. */
export const FEATURED_BASES = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"] as const

export function findSymbol(base: string): MarketSymbol | undefined {
  const upper = base.toUpperCase()
  return MARKET_SYMBOLS.find((m) => m.base === upper || m.symbol === upper)
}

export function toBase(symbol: string): string {
  return MARKET_SYMBOLS.find((m) => m.symbol === symbol)?.base ?? symbol.replace(/USDT$/, "")
}
