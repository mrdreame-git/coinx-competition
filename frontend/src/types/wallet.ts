export type TransactionType = "deposit" | "entry" | "prize" | "withdrawal"

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  label: string
  time: string
  positive: boolean
}

export interface Asset {
  coin: string
  name: string
  amount: string
  usd: string
}
