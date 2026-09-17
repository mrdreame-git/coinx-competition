"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import {
  TRANSACTIONS,
  ASSETS,
  WALLET_BALANCE,
  DEPOSIT_ADDRESS,
  NETWORKS,
} from "@/mocks/wallet"
import type { TransactionType } from "@/types/wallet"

type WalletTab = "deposit" | "withdraw"

const TX_FILTERS: ("all" | TransactionType)[] = [
  "all",
  "deposit",
  "withdrawal",
  "entry",
  "prize",
]

export default function WalletPage() {
  const [tab, setTab] = useState<WalletTab>("deposit")
  const [network, setNetwork] = useState("TRC20")
  const [txFilter, setTxFilter] = useState<"all" | TransactionType>("all")
  const filtered =
    txFilter === "all"
      ? TRANSACTIONS
      : TRANSACTIONS.filter((t) => t.type === txFilter)

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-black text-3xl mb-8" style={{ color: "#FFFFFF" }}>
          WALLET
        </h1>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-5">
            <div className="glass-blue rounded-2xl p-6 glow-blue">
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "#A4AEC0" }}
              >
                TOTAL BALANCE
              </div>
              <div
                className="font-black text-4xl font-mono"
                style={{ color: "#FFFFFF" }}
              >
                {WALLET_BALANCE}
              </div>
              <div
                className="font-mono text-base mb-6"
                style={{ color: "#A4AEC0" }}
              >
                USDT
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setTab("deposit")}
                  className="btn-primary w-full py-3 rounded-xl text-sm"
                >
                  DEPOSIT
                </button>
                <button
                  onClick={() => setTab("withdraw")}
                  className="btn-ghost w-full py-3 rounded-xl text-sm"
                >
                  WITHDRAW
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div
                className="text-xs font-semibold mb-4"
                style={{ color: "#A4AEC0" }}
              >
                ASSETS
              </div>
              {ASSETS.map((a) => (
                <div
                  key={a.coin}
                  className="flex items-center gap-3 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs"
                    style={{
                      background: "linear-gradient(135deg, #1677FF, #6D4AFF)",
                      color: "white",
                    }}
                  >
                    {a.coin[0]}
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm font-bold"
                      style={{ color: "#E5EAF3" }}
                    >
                      {a.coin}
                    </div>
                    <div className="text-xs" style={{ color: "#A4AEC0" }}>
                      {a.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-sm font-mono font-bold"
                      style={{ color: "#E5EAF3" }}
                    >
                      {a.amount}
                    </div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: "#A4AEC0" }}
                    >
                      {a.usd}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="glass rounded-2xl p-6">
              <div
                className="flex rounded-xl overflow-hidden mb-6"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {(["deposit", "withdraw"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                      tab === t ? "tab-active" : "text-gray-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "deposit" ? (
                <div className="space-y-5">
                  <div>
                    <label
                      className="text-xs font-semibold mb-1.5 block"
                      style={{ color: "#A4AEC0" }}
                    >
                      NETWORK
                    </label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="input-field w-full px-4 py-3 rounded-xl text-sm"
                    >
                      {NETWORKS.map((n) => (
                        <option key={n.value} value={n.value}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,176,32,0.05)",
                      border: "1px solid rgba(255,176,32,0.2)",
                    }}
                  >
                    <div className="text-xs" style={{ color: "#FFB020" }}>
                      ⚠ Only send USDT through the selected network. Sending
                      other assets may result in permanent loss.
                    </div>
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold mb-1.5 block"
                      style={{ color: "#A4AEC0" }}
                    >
                      DEPOSIT ADDRESS
                    </label>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 px-4 py-3 rounded-xl font-mono text-xs truncate"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#A4AEC0",
                        }}
                      >
                        {DEPOSIT_ADDRESS}
                      </div>
                      <button className="btn-primary px-4 py-3 rounded-xl text-xs font-bold">
                        COPY
                      </button>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center py-6 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="w-32 h-32 rounded-xl flex items-center justify-center"
                      style={{ background: "white", padding: 8 }}
                    >
                      <svg
                        viewBox="0 0 21 21"
                        width="128"
                        height="128"
                        aria-label="Deposit QR code"
                      >
                        {Array.from({ length: 21 }, (_, row) =>
                          Array.from({ length: 21 }, (_, col) => {
                            const noise = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453
                            const dark =
                              (row < 9 && col < 9) ||
                              (row < 9 && col > 11) ||
                              (row > 11 && col < 9) ||
                              noise - Math.floor(noise) > 0.5
                            return dark ? (
                              <rect
                                key={`${row}-${col}`}
                                x={col}
                                y={row}
                                width="1"
                                height="1"
                                fill="#000"
                              />
                            ) : null
                          }),
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-xs font-semibold mb-1.5 block"
                      style={{ color: "#A4AEC0" }}
                    >
                      NETWORK
                    </label>
                    <select className="input-field w-full px-4 py-3 rounded-xl text-sm">
                      <option>USDT — BSC (BNB Chain)</option>
                      <option>USDT — TRC20 (Tron)</option>
                      <option>USDT — ERC20 (Ethereum)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold mb-1.5 block"
                      style={{ color: "#A4AEC0" }}
                    >
                      WALLET ADDRESS
                    </label>
                    <input
                      className="input-field w-full px-4 py-3 rounded-xl text-sm font-mono"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold mb-1.5 block"
                      style={{ color: "#A4AEC0" }}
                    >
                      AMOUNT (USDT)
                    </label>
                    <input
                      className="input-field w-full px-4 py-3 rounded-xl text-sm font-mono"
                      placeholder="500"
                      defaultValue="500"
                    />
                  </div>
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {[
                      ["Network Fee", "2 USDT"],
                      ["You Receive", "498 USDT"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span style={{ color: "#A4AEC0" }}>{l}</span>
                        <span
                          className="font-mono font-bold"
                          style={{
                            color: l === "You Receive" ? "#00D084" : "#E5EAF3",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold">
                    CONFIRM WITHDRAWAL
                  </button>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="font-bold text-sm" style={{ color: "#FFFFFF" }}>
                  TRANSACTION HISTORY
                </div>
                <div className="flex gap-1 flex-wrap">
                  {TX_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setTxFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all ${
                        txFilter === f ? "tab-active" : "btn-ghost"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? (
                <div
                  className="text-center py-8 text-sm"
                  style={{ color: "#A4AEC0" }}
                >
                  No transactions found.
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 py-2.5"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: tx.positive
                            ? "rgba(0,208,132,0.1)"
                            : "rgba(255,77,103,0.1)",
                        }}
                      >
                        <span className="text-xs">
                          {tx.positive ? "↑" : "↓"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#E5EAF3" }}
                        >
                          {tx.label}
                        </div>
                        <div className="text-xs" style={{ color: "#A4AEC0" }}>
                          {tx.time}
                        </div>
                      </div>
                      <div
                        className="font-mono text-sm font-bold"
                        style={{ color: tx.positive ? "#00D084" : "#FF4D67" }}
                      >
                        {tx.positive ? "+" : ""}
                        {tx.amount} USDT
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
