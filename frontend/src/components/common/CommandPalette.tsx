"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/app"

interface PaletteItem {
  label: string
  section: string
  action: () => void
  keywords: string[]
}

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items: PaletteItem[] = [
    { label: "Dashboard", section: "Navigation", action: () => router.push(ROUTES.dashboard), keywords: ["home", "main"] },
    { label: "Markets", section: "Navigation", action: () => router.push(ROUTES.markets), keywords: ["trade", "list", "all"] },
    { label: "Competitions", section: "Navigation", action: () => router.push(ROUTES.competitions), keywords: ["compete", "challenge"] },
    { label: "Leaderboard", section: "Navigation", action: () => router.push(ROUTES.leaderboard), keywords: ["rank", "top"] },
    { label: "Wallet", section: "Navigation", action: () => router.push(ROUTES.wallet), keywords: ["balance", "deposit", "withdraw"] },
    { label: "Notifications", section: "Navigation", action: () => router.push(ROUTES.notifications), keywords: ["alerts", "messages"] },
    { label: "Profile", section: "Navigation", action: () => router.push(ROUTES.profile), keywords: ["account", "settings"] },
    { label: "BTC / USDT", section: "Markets", action: () => router.push(ROUTES.marketDetail("BTC")), keywords: ["bitcoin", "btc"] },
    { label: "ETH / USDT", section: "Markets", action: () => router.push(ROUTES.marketDetail("ETH")), keywords: ["ethereum", "eth"] },
    { label: "SOL / USDT", section: "Markets", action: () => router.push(ROUTES.marketDetail("SOL")), keywords: ["solana"] },
    { label: "BNB / USDT", section: "Markets", action: () => router.push(ROUTES.marketDetail("BNB")), keywords: ["bnb", "binance"] },
  ]

  const filtered = query
    ? items.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : items

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery("")
        setSelected(0)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected((s) => (s + 1) % filtered.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected((s) => (s - 1 + filtered.length) % filtered.length)
      } else if (e.key === "Enter" && filtered[selected]) {
        filtered[selected].action()
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, filtered, selected])

  if (!open) return null

  const sections = [...new Set(filtered.map((i) => i.section))]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      style={{ background: "rgba(8,13,24,0.8)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12,19,32,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A4AEC0" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#FFFFFF" }}
          />
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A4AEC0" }}
          >
            ESC
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section}>
              <div
                className="px-5 py-1.5 text-[10px] font-mono tracking-widest uppercase"
                style={{ color: "#A4AEC0" }}
              >
                {section}
              </div>
              {filtered
                .filter((i) => i.section === section)
                .map((item) => {
                  const idx = filtered.indexOf(item)
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action()
                        setOpen(false)
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm flex items-center gap-3 transition-colors"
                      style={{
                        color: idx === selected ? "#FFFFFF" : "#E5EAF3",
                        background: idx === selected ? "rgba(22,119,255,0.12)" : "transparent",
                      }}
                    >
                      <span>{item.label}</span>
                    </button>
                  )
                })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm" style={{ color: "#A4AEC0" }}>
              No results found.
            </div>
          )}
        </div>

        <div
          className="px-5 py-2.5 flex items-center gap-4 text-[10px] font-mono"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#A4AEC0" }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
