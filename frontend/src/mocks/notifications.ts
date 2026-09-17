import type { AppNotification } from "@/types/notification"

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "Competition starting soon",
    body: "BTC Challenge starts in 5 minutes.",
    time: "4m ago",
    read: false,
    type: "warning",
  },
  {
    id: 2,
    title: "Rank changed",
    body: "You moved from #17 to #12. Keep pushing!",
    time: "12m ago",
    read: false,
    type: "success",
  },
  {
    id: 3,
    title: "Competition finished",
    body: "You finished #7 in BTC 60 Min Challenge.",
    time: "2h ago",
    read: true,
    type: "info",
  },
  {
    id: 4,
    title: "Prize received",
    body: "500 USDT has been credited to your wallet.",
    time: "2h ago",
    read: true,
    type: "success",
  },
  {
    id: 5,
    title: "Deposit confirmed",
    body: "500 USDT has been added to your balance.",
    time: "1d ago",
    read: true,
    type: "success",
  },
  {
    id: 6,
    title: "Withdrawal completed",
    body: "498 USDT has been sent to your address.",
    time: "2d ago",
    read: true,
    type: "info",
  },
]
