import type { Transaction, Asset } from "@/types/wallet"

export const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    type: "deposit",
    amount: 500,
    label: "Deposit confirmed",
    time: "2h ago",
    positive: true,
  },
  {
    id: 2,
    type: "entry",
    amount: -100,
    label: "BTC Challenge entry",
    time: "3h ago",
    positive: false,
  },
  {
    id: 3,
    type: "prize",
    amount: 500,
    label: "Competition prize",
    time: "1d ago",
    positive: true,
  },
  {
    id: 4,
    type: "withdrawal",
    amount: -500,
    label: "Withdrawal to BSC",
    time: "2d ago",
    positive: false,
  },
  {
    id: 5,
    type: "deposit",
    amount: 1000,
    label: "Deposit confirmed",
    time: "3d ago",
    positive: true,
  },
  {
    id: 6,
    type: "entry",
    amount: -50,
    label: "ETH Challenge entry",
    time: "4d ago",
    positive: false,
  },
  {
    id: 7,
    type: "prize",
    amount: 280,
    label: "SOL Sprint prize",
    time: "5d ago",
    positive: true,
  },
]

export const ASSETS: Asset[] = [
  { coin: "USDT", name: "Tether", amount: "1,250.00", usd: "$1,250" },
  { coin: "BTC", name: "Bitcoin", amount: "0.0023", usd: "$272" },
  { coin: "ETH", name: "Ethereum", amount: "0.082", usd: "$379" },
]

export const WALLET_BALANCE = "1,250.00"

export const DEPOSIT_ADDRESS = "TGsXJxNR7oo3PV4TxwM2N8Vfkwxe3GmfFx"

export const NETWORKS = [
  { value: "TRC20", label: "USDT on TRC20 (Tron)" },
  { value: "ERC20", label: "USDT on ERC20 (Ethereum)" },
  { value: "BSC", label: "USDT on BSC (BNB Chain)" },
]
