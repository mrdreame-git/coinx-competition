import type {
  Market,
  OrderBookEntry,
  TapeEntry,
  DepthBar,
  MarketStat,
  FundingRate,
  OpenInterestPoint,
  MarkPrice,
  Position,
  OpenOrder,
  FilledOrder,
} from "@/types/market"

function seeded(i: number, salt = 0): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const MARKETS: Market[] = [
  {
    symbol: "BTC",
    pair: "BTC / USDT",
    name: "Bitcoin",
    price: 118245.3,
    change24h: 1.24,
    high24h: 119500,
    low24h: 116800,
    volume24h: "$1.82B",
    openInterest: "$892M",
    sparkline: [42, 38, 45, 40, 48, 52, 46, 50, 55, 53, 58],
    category: "perp",
  },
  {
    symbol: "ETH",
    pair: "ETH / USDT",
    name: "Ethereum",
    price: 3842.15,
    change24h: 2.87,
    high24h: 3910,
    low24h: 3720,
    volume24h: "$987M",
    openInterest: "$412M",
    sparkline: [30, 35, 32, 38, 42, 40, 45, 43, 48, 46, 50],
    category: "perp",
  },
  {
    symbol: "SOL",
    pair: "SOL / USDT",
    name: "Solana",
    price: 247.83,
    change24h: -0.42,
    high24h: 252,
    low24h: 244,
    volume24h: "$654M",
    openInterest: "$234M",
    sparkline: [50, 48, 52, 46, 44, 47, 42, 45, 43, 41, 44],
    category: "perp",
  },
  {
    symbol: "BNB",
    pair: "BNB / USDT",
    name: "BNB",
    price: 682.4,
    change24h: 0.95,
    high24h: 690,
    low24h: 675,
    volume24h: "$312M",
    openInterest: "$156M",
    sparkline: [35, 38, 36, 40, 42, 39, 43, 41, 44, 46, 45],
    category: "perp",
  },
  {
    symbol: "XRP",
    pair: "XRP / USDT",
    name: "Ripple",
    price: 2.847,
    change24h: 3.12,
    high24h: 2.92,
    low24h: 2.74,
    volume24h: "$478M",
    openInterest: "$189M",
    sparkline: [20, 25, 28, 32, 30, 35, 38, 36, 40, 42, 45],
    category: "perp",
  },
  {
    symbol: "DOGE",
    pair: "DOGE / USDT",
    name: "Dogecoin",
    price: 0.3842,
    change24h: -1.85,
    high24h: 0.398,
    low24h: 0.375,
    volume24h: "$287M",
    openInterest: "$98M",
    sparkline: [45, 42, 40, 38, 41, 36, 34, 37, 35, 33, 36],
    category: "perp",
  },
  {
    symbol: "AVAX",
    pair: "AVAX / USDT",
    name: "Avalanche",
    price: 42.18,
    change24h: 4.56,
    high24h: 43.5,
    low24h: 40.1,
    volume24h: "$198M",
    openInterest: "$87M",
    sparkline: [15, 20, 22, 28, 30, 35, 32, 38, 40, 42, 45],
    category: "perp",
  },
  {
    symbol: "LINK",
    pair: "LINK / USDT",
    name: "Chainlink",
    price: 18.92,
    change24h: 1.73,
    high24h: 19.4,
    low24h: 18.2,
    volume24h: "$156M",
    openInterest: "$67M",
    sparkline: [28, 30, 32, 29, 34, 36, 33, 37, 35, 38, 40],
    category: "perp",
  },
  {
    symbol: "ADA",
    pair: "ADA / USDT",
    name: "Cardano",
    price: 0.892,
    change24h: -0.67,
    high24h: 0.915,
    low24h: 0.878,
    volume24h: "$134M",
    openInterest: "$56M",
    sparkline: [38, 36, 34, 37, 35, 33, 36, 34, 32, 35, 33],
    category: "perp",
  },
  {
    symbol: "MATIC",
    pair: "MATIC / USDT",
    name: "Polygon",
    price: 0.547,
    change24h: 2.31,
    high24h: 0.562,
    low24h: 0.531,
    volume24h: "$98M",
    openInterest: "$42M",
    sparkline: [22, 25, 28, 26, 30, 32, 29, 34, 33, 36, 38],
    category: "perp",
  },
  {
    symbol: "DOT",
    pair: "DOT / USDT",
    name: "Polkadot",
    price: 7.84,
    change24h: -2.14,
    high24h: 8.12,
    low24h: 7.65,
    volume24h: "$87M",
    openInterest: "$38M",
    sparkline: [40, 38, 36, 34, 37, 32, 30, 33, 31, 29, 32],
    category: "perp",
  },
  {
    symbol: "UNI",
    pair: "UNI / USDT",
    name: "Uniswap",
    price: 12.47,
    change24h: 1.08,
    high24h: 12.85,
    low24h: 12.15,
    volume24h: "$76M",
    openInterest: "$34M",
    sparkline: [25, 28, 26, 30, 32, 29, 33, 31, 34, 32, 35],
    category: "perp",
  },
]

export function generateOrderBook(midPrice: number): {
  asks: OrderBookEntry[]
  bids: OrderBookEntry[]
  spread: string
} {
  const asks: OrderBookEntry[] = []
  const bids: OrderBookEntry[] = []
  let askTotal = 0
  let bidTotal = 0

  for (let i = 9; i >= 0; i--) {
    const price = midPrice + (i + 1) * midPrice * 0.0001
    const qty = +(seeded(i, 1) * 5 + 0.1).toFixed(3)
    askTotal += qty
    asks.push({ price: +price.toFixed(2), qty, total: +askTotal.toFixed(3) })
  }

  for (let i = 0; i < 10; i++) {
    const price = midPrice - (i + 1) * midPrice * 0.0001
    const qty = +(seeded(i, 2) * 5 + 0.1).toFixed(3)
    bidTotal += qty
    bids.push({ price: +price.toFixed(2), qty, total: +bidTotal.toFixed(3) })
  }

  const spread = ((asks[0].price - bids[0].price) / midPrice * 100).toFixed(4)

  return { asks, bids, spread: `${spread}%` }
}

export function generateTape(midPrice: number): TapeEntry[] {
  const entries: TapeEntry[] = []
  for (let i = 0; i < 12; i++) {
    const side = seeded(i, 3) > 0.5 ? ("buy" as const) : ("sell" as const)
    const price = midPrice + (seeded(i, 4) - 0.5) * midPrice * 0.0003
    const qty = +(seeded(i, 5) * 3 + 0.01).toFixed(4)
    const min = 59 - i
    const sec = Math.floor(seeded(i, 6) * 60)
    entries.push({
      price: +price.toFixed(2),
      qty,
      time: `${min}:${sec.toString().padStart(2, "0")}`,
      side,
    })
  }
  return entries
}

export function generateDepth(): { bids: DepthBar[]; asks: DepthBar[] } {
  const bids: DepthBar[] = []
  const asks: DepthBar[] = []
  for (let i = 0; i < 20; i++) {
    bids.push({ height: `${Math.max(10, 100 - i * 4 + seeded(i, 7) * 15)}%` })
    asks.push({ height: `${Math.max(10, 100 - i * 4 + seeded(i, 8) * 15)}%` })
  }
  return { bids, asks }
}

export const MARKET_STATS: MarketStat[] = [
  { label: "24h High", value: "119,500" },
  { label: "24h Low", value: "116,800" },
  { label: "24h Vol", value: "$1.82B" },
  { label: "Open Interest", value: "$892M" },
  { label: "Funding Rate", value: "0.0100%" },
  { label: "Mark Price", value: "118,248.30" },
]

export const FUNDING_RATES: FundingRate[] = [
  { time: "18:00", rate: "0.0100%", predicted: "0.0089%" },
  { time: "12:00", rate: "0.0087%", predicted: "0.0100%" },
  { time: "06:00", rate: "0.0123%", predicted: "0.0087%" },
  { time: "00:00", rate: "0.0098%", predicted: "0.0123%" },
  { time: "18:00", rate: "0.0112%", predicted: "0.0098%" },
  { time: "12:00", rate: "0.0078%", predicted: "0.0112%" },
]

export const OPEN_INTEREST_DATA: OpenInterestPoint[] = [
  { time: "00:00", value: "$845M", change: "+2.1%" },
  { time: "04:00", value: "$862M", change: "+2.0%" },
  { time: "08:00", value: "$878M", change: "+1.9%" },
  { time: "12:00", value: "$891M", change: "+1.5%" },
  { time: "16:00", value: "$887M", change: "-0.4%" },
  { time: "20:00", value: "$892M", change: "+0.6%" },
]

export const MARK_PRICES: MarkPrice[] = [
  { symbol: "BTC", markPrice: "118,248.30", indexPrice: "118,241.50", fundingRate: "0.0100%", nextFunding: "2h 14m" },
  { symbol: "ETH", markPrice: "3,842.15", indexPrice: "3,841.80", fundingRate: "0.0112%", nextFunding: "2h 14m" },
  { symbol: "SOL", markPrice: "247.83", indexPrice: "247.79", fundingRate: "0.0095%", nextFunding: "2h 14m" },
  { symbol: "BNB", markPrice: "682.40", indexPrice: "682.35", fundingRate: "0.0088%", nextFunding: "2h 14m" },
]

export const MY_POSITIONS: Position[] = [
  {
    symbol: "BTC",
    side: "Long",
    leverage: "10x",
    qty: "0.0023",
    entry: "117,800",
    mark: "118,245",
    liq: "106,020",
    pnl: 1.02,
    pnlColor: "#00D084",
    margin: 27.4,
    marginRatio: 73,
  },
  {
    symbol: "ETH",
    side: "Long",
    leverage: "5x",
    qty: "0.1250",
    entry: "3,780",
    mark: "3,842",
    liq: "3,024",
    pnl: 7.75,
    pnlColor: "#00D084",
    margin: 94.5,
    marginRatio: 62,
  },
  {
    symbol: "SOL",
    side: "Short",
    leverage: "3x",
    qty: "2.5000",
    entry: "251.20",
    mark: "247.83",
    liq: "334.93",
    pnl: 8.43,
    pnlColor: "#00D084",
    margin: 209.3,
    marginRatio: 45,
  },
]

export const MY_OPEN_ORDERS: OpenOrder[] = [
  { time: "16:42:18", symbol: "BTC", side: "Buy", type: "Limit", price: "117,500", qty: "0.0010" },
  { time: "15:31:05", symbol: "ETH", side: "Sell", type: "Limit", price: "3,950", qty: "0.0500" },
]

export const MY_FILLED_ORDERS: FilledOrder[] = [
  { time: "16:18:42", symbol: "BTC", side: "Buy", type: "Market", price: "117,800", qty: "0.0023", status: "Filled" },
  { time: "15:55:12", symbol: "ETH", side: "Buy", type: "Market", price: "3,780", qty: "0.1250", status: "Filled" },
  { time: "14:22:33", symbol: "SOL", side: "Sell", type: "Market", price: "251.20", qty: "2.5000", status: "Filled" },
  { time: "13:45:08", symbol: "BTC", side: "Sell", type: "Limit", price: "119,200", qty: "0.0050", status: "Cancelled" },
  { time: "12:11:55", symbol: "ETH", side: "Buy", type: "Market", price: "3,750", qty: "0.2000", status: "Filled" },
]

export const TRADE_LOG_ENTRIES = [
  { time: "16:42", name: "CryptoKing", action: "BUY", sym: "BTC", color: "#00D084" },
  { time: "16:41", name: "Alpha_X", action: "SELL", sym: "ETH", color: "#FF4D67" },
  { time: "16:40", name: "YOU", action: "BUY", sym: "BTC", color: "#00D084" },
  { time: "16:39", name: "BullRunner", action: "BUY", sym: "SOL", color: "#00D084" },
  { time: "16:38", name: "SatoshiV", action: "SELL", sym: "BTC", color: "#FF4D67" },
  { time: "16:37", name: "NightOwl", action: "BUY", sym: "ETH", color: "#00D084" },
  { time: "16:36", name: "MoonShot", action: "SELL", sym: "SOL", color: "#FF4D67" },
  { time: "16:35", name: "DigitalApe", action: "BUY", sym: "BTC", color: "#00D084" },
]
