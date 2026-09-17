"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/config/app"
import { useAuth } from "@/features/auth/auth-context"

interface HeaderProps {
  active?: string
  notifCount?: number
}

const NAV_ITEMS: { label: string; route: string }[] = [
  { label: "Dashboard", route: ROUTES.dashboard },
  { label: "Markets", route: ROUTES.markets },
  { label: "Competitions", route: ROUTES.competitions },
  { label: "Wallet", route: ROUTES.wallet },
  { label: "Leaderboard", route: ROUTES.leaderboard },
]

export default function Header({ active, notifCount = 2 }: HeaderProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const current = active ?? pathname

  const isActive = (route: string) => {
    if (route === ROUTES.dashboard) return current === route
    return current.startsWith(route)
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(8,13,24,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link href={ROUTES.landing} className="flex items-center gap-2 shrink-0">
          <Image
            src="/coinx-logo-long.png"
            alt="COINX"
            width={110}
            height={20}
            priority
            style={{ width: "110px", height: "auto" }}
          />
        </Link>
        <nav className="flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.route}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color: isActive(item.route) ? "#00C8FF" : "#A4AEC0",
                background: isActive(item.route) ? "rgba(0,200,255,0.08)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#A4AEC0",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Jump to…</span>
            <span
              className="px-1 py-0.5 rounded text-[10px]"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A4AEC0" }}
            >
              ⌘K
            </span>
          </button>
          <Link
            href={ROUTES.notifications}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Notifications"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A4AEC0"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "#FF4D67", color: "white" }}
              >
                {notifCount}
              </div>
            )}
          </Link>
          <Link
            href={ROUTES.profile}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, #2563EB, #6D4AFF)",
              color: "white",
            }}
            aria-label="Profile"
          >
            {user.initial}
          </Link>
        </div>
      </div>
    </header>
  )
}
