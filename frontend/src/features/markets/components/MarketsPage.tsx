"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import { MARKETS } from "@/mocks/markets"
import type { Market } from "@/types/market"

type Tab = "all" | "popular" | "movers" | "spotlight"
type SortKey = "pair" | "price" | "change24h" | "high24h" | "low24h" | "volume24h"
type SortDir = "asc" | "desc"

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "popular", label: "MOST POPULAR" },
  { key: "movers", label: "MOVERS" },
  { key: "spotlight", label: "SPOTLIGHT" },
]

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const h = 22
  const w = 44
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ")
  const color = positive ? "#00D084" : "#FF4D67"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  )
}

export default function MarketsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("all")
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("volume24h")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const filtered = useMemo(() => {
    let list = [...MARKETS]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.symbol.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.pair.toLowerCase().includes(q)
      )
    }

    if (tab === "popular") {
      list = list.filter((m) => ["BTC", "ETH", "SOL", "BNB"].includes(m.symbol))
    } else if (tab === "movers") {
      list = list.filter((m) => Math.abs(m.change24h) > 1.5)
    } else if (tab === "spotlight") {
      list = list.filter((m) => m.change24h > 2)
    }

    list.sort((a, b) => {
      let va: number, vb: number
      switch (sortKey) {
        case "pair":
          return sortDir === "asc"
            ? a.pair.localeCompare(b.pair)
            : b.pair.localeCompare(a.pair)
        case "price":
          va = a.price
          vb = b.price
          break
        case "change24h":
          va = Math.abs(a.change24h)
          vb = Math.abs(b.change24h)
          break
        case "high24h":
          va = a.high24h
          vb = b.high24h
          break
        case "low24h":
          va = a.low24h
          vb = b.low24h
          break
        default:
          va = 0
          vb = 0
          break
      }
      return sortDir === "asc" ? va - vb : vb - va
    })

    return list
  }, [tab, search, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const colHeader = (key: SortKey, label: string, align: "left" | "right" = "right") => (
    <div
      onClick={() => handleSort(key)}
      className="cursor-pointer select-none flex items-center gap-1"
      style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}
    >
      <span>{label}</span>
      <span style={{ fontSize: "8px", color: sortKey === key ? "#00C8FF" : "#A4AEC0" }}>
        {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between gap-10 mb-6">
          <div>
            <div className="text-xs font-mono tracking-widest mb-2" style={{ color: "#A4AEC0" }}>
              Perpetual futures · USDT margined
            </div>
            <h1 className="font-black text-5xl tracking-tight" style={{ color: "#FFFFFF" }}>
              MARKETS
            </h1>
          </div>
          <div className="flex items-stretch glass rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="text-[10px] font-mono tracking-widest" style={{ color: "#A4AEC0" }}>
                24h volume
              </div>
              <div className="font-black text-lg font-mono" style={{ color: "#FFFFFF" }}>
                $3.71B
              </div>
            </div>
            <div className="px-5 py-3">
              <div className="text-[10px] font-mono tracking-widest" style={{ color: "#A4AEC0" }}>
                Open interest
              </div>
              <div className="font-black text-lg font-mono" style={{ color: "#FFFFFF" }}>
                $1.59B
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0 mb-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-5 py-3 text-sm font-bold tracking-wide uppercase transition-all"
              style={{
                color: tab === t.key ? "#00C8FF" : "#A4AEC0",
                borderBottom: tab === t.key ? "2px solid #1677FF" : "2px solid transparent",
                background: tab === t.key ? "rgba(22,119,255,0.08)" : "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
          <div className="flex-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search market"
            className="input-field px-4 py-2 rounded-lg text-sm font-mono mb-2"
            style={{ width: "220px" }}
          />
        </div>

        <div className="glass rounded-b-2xl rounded-t-none overflow-hidden">
          <div
            className="grid items-center h-10 text-[10px] font-mono tracking-widest uppercase px-4"
            style={{
              gridTemplateColumns: "minmax(0,1.5fr) 130px 100px 120px 120px 130px 110px 80px",
              color: "#A4AEC0",
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {colHeader("pair", "Pair", "left")}
            {colHeader("price", "Price")}
            {colHeader("change24h", "24h Chg")}
            {colHeader("high24h", "24h High")}
            {colHeader("low24h", "24h Low")}
            <div>Volume</div>
            <div>Trend</div>
            <div style={{ textAlign: "right" }}></div>
          </div>

          {filtered.map((m, i) => (
            <div
              key={m.symbol}
              onClick={() => router.push(ROUTES.marketDetail(m.symbol))}
              className="grid items-center h-13 px-4 cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: "minmax(0,1.5fr) 130px 100px 120px 120px 130px 110px 80px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }}
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="font-bold text-lg tracking-wide uppercase" style={{ color: "#FFFFFF" }}>
                  {m.symbol}
                </span>
                <span className="text-sm truncate" style={{ color: "#A4AEC0" }}>
                  {m.name}
                </span>
                <span
                  className="text-[9px] tracking-widest px-1.5 py-0.5 rounded"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: m.category === "perp" ? "#00C8FF" : "#A4AEC0",
                  }}
                >
                  PERP
                </span>
              </div>
              <div className="text-right font-mono text-sm font-bold" style={{ color: "#FFFFFF" }}>
                {m.price < 10 ? m.price.toFixed(4) : m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div
                className="text-right font-mono text-sm font-semibold"
                style={{ color: m.change24h >= 0 ? "#00D084" : "#FF4D67" }}
              >
                {m.change24h >= 0 ? "+" : ""}
                {m.change24h.toFixed(2)}%
              </div>
              <div className="text-right font-mono text-sm" style={{ color: "#B8C0CC" }}>
                {m.high24h < 10 ? m.high24h.toFixed(4) : m.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="text-right font-mono text-sm" style={{ color: "#B8C0CC" }}>
                {m.low24h < 10 ? m.low24h.toFixed(4) : m.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="text-right font-mono text-sm" style={{ color: "#C8D0DC" }}>
                {m.volume24h}
              </div>
              <div className="flex items-end justify-center gap-0.5" style={{ height: "26px" }}>
                <Sparkline data={m.sparkline} positive={m.change24h >= 0} />
              </div>
              <div className="text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(ROUTES.marketDetail(m.symbol))
                  }}
                  className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-all"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#00C8FF",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#00C8FF"
                    e.currentTarget.style.color = "#080D18"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "#00C8FF"
                  }}
                >
                  TRADE
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm" style={{ color: "#A4AEC0" }}>
              No markets found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
