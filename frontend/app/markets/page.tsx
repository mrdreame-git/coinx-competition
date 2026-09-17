import type { Metadata } from "next"
import MarketsPage from "@/features/markets/components/MarketsPage"

export const metadata: Metadata = {
  title: "Markets — COINX",
}

export default function Page() {
  return <MarketsPage />
}
