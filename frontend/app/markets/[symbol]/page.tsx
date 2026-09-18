import type { Metadata } from 'next'
import MarketDetailPage from '@/features/markets/components/MarketDetailPage'
import { findSymbol } from '@/lib/binance/symbols'

interface RouteParams {
  params: Promise<{ symbol: string }>
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { symbol } = await params
  const market = findSymbol(decodeURIComponent(symbol))
  if (!market) return { title: 'Market not listed' }

  return {
    title: `${market.pair} perpetual`,
    description: `Live ${market.pair} perpetual futures: candlesticks, order book, funding rate, open interest and recent fills, streamed from the Binance futures API.`,
  }
}

export default function MarketSymbolRoute() {
  return <MarketDetailPage />
}
