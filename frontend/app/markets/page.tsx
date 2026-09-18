import type { Metadata } from 'next'
import MarketsPage from '@/features/markets/components/MarketsPage'

export const metadata: Metadata = {
  title: 'Markets',
  description:
    'Every USDT-margined perpetual on COINX with live price, 24 hour change, range, quote volume and trend, streamed from the Binance futures API.',
}

export default function MarketsRoute() {
  return <MarketsPage />
}
