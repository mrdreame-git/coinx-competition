import type { Metadata } from "next"
import MarketDetailPage from "@/features/markets/components/MarketDetailPage"

export const metadata: Metadata = {
  title: "Market — COINX",
}

export default function Page() {
  return <MarketDetailPage />
}
