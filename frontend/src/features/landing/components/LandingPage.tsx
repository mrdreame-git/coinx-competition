import { ArrowDown, Trophy, ChartLineUp, ArrowUp, Medal, CurrencyUsd, Balance, ArrowCircleRight, ArrowCircleLeft, LockSimple, Info } from "@phosphor-icons/react"

import Link from "next/link"
import { ROUTES } from "@/config/app"
import Orbs from "@/components/common/Orbs"
import CompetitionCard from "@/features/competitions/components/CompetitionCard"
import { COMPETITIONS } from "@/mocks/competitions"

const STATS = [
  ["$2.4M+", "PRIZES PAID"],
  ["50K+", "TRADERS"],
  ["99.9%", "UPTIME"],
] as const

  const STEPS = [
    { n: "01", label: "DEPOSIT", icon: <ArrowDown size={24} className="text-zinc-400" /> },
    { n: "02", label: "CHOOSE", icon: <Trophy size={24} className="text-zinc-400" /> },
    { n: "03", label: "TRADE", icon: <ChartLineUp size={24} className="text-zinc-400" /> },
    { n: "04", label: "CLIMB", icon: <ArrowUp size={24} className="text-zinc-400" /> },
    { n: "05", label: "WIN", icon: <Medal size={24} className="text-zinc-400" /> },
    { n: "06", label: "WITHDRAW", icon: <CurrencyUsd size={24} className="text-zinc-400" /> },
  ]


  const FEATURES = [
    {
      title: "Fair Competition",
      desc: "All traders start with identical capital. Pure skill wins.",
      icon: <Balance size={32} className="text-zinc-400" />,
    },
    {
      title: "Real-time Ranking",
      desc: "Watch your rank update live as you trade.",
      icon: <ArrowCircleRight size={32} className="text-zinc-400" />,
    },
    {
      title: "Secure Wallet",
      desc: "Multi-sig cold storage. Your funds are protected.",
      icon: <LockSimple size={32} className="text-zinc-400" />,
    },
    {
      title: "Transparent Rules",
      desc: "Clear, simple rules. No hidden fees or surprises.",
      icon: <Info size={32} className="text-zinc-400" />,
    },
    {
      title: "Fast Withdrawals",
      desc: "Prizes credited instantly. Withdraw in minutes.",
      icon: <ArrowCircleLeft size={32} className="text-zinc-400" />,
    },
  ]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid" style={{ background: "#080D18" }}>
      <section className="relative min-h-screen flex flex-col">
        <Orbs variant="hero" />
        <div className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <Link href={ROUTES.landing}>
            <Image
              src="/coinx-logo-long.png"
              alt="COINX"
              width={130}
              height={24}
              priority
              style={{ width: "130px", height: "auto" }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {["Competitions", "How It Works", "Prizes"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: "#A4AEC0" }}
              >
                {l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.login}
              className="btn-ghost text-sm px-5 py-2.5 rounded-xl"
            >
              Login
            </Link>
            <Link
              href={ROUTES.register}
              className="btn-cyan text-sm px-5 py-2.5 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full grid md:grid-cols-2 gap-12 items-center py-16">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{
                  background: "rgba(0,200,255,0.08)",
                  border: "1px solid rgba(0,200,255,0.2)",
                  color: "#00C8FF",
                }}
              >
                <div className="live-dot" />
                LIVE COMPETITIONS NOW
              </div>
              <h1 className="font-black text-6xl md:text-7xl leading-none tracking-tighter mb-6">
                <span style={{ color: "#FFFFFF" }}>TRADE.</span>
                <br />
                <span className="gradient-text">COMPETE.</span>
                <br />
                <span style={{ color: "#FFFFFF" }}>WIN.</span>
              </h1>
              <p
                className="text-lg mb-8 leading-relaxed max-w-lg"
                style={{ color: "#A4AEC0" }}
              >
                Real crypto trading competitions. Trade against other players,
                climb the leaderboard, and win real prizes.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={ROUTES.register}
                  className="btn-cyan text-base px-8 py-4 rounded-xl font-black tracking-wide"
                >
                  JOIN NOW
                </Link>
                <Link
                  href={ROUTES.competitions}
                  className="btn-ghost text-base px-8 py-4 rounded-xl"
                >
                  VIEW COMPETITIONS
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10">
                {STATS.map(([v, l]) => (
                  <div key={l}>
                    <div className="font-black text-2xl font-mono gradient-text-blue">
                      {v}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "#A4AEC0" }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-96 h-96">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(109,74,255,0.2) 0%, transparent 70%)",
                  }}
                />
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <radialGradient id="coreGrad" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#00C8FF" stopOpacity="0.9" />
                      <stop
                        offset="50%"
                        stopColor="#1677FF"
                        stopOpacity="0.6"
                      />
                      <stop
                        offset="100%"
                        stopColor="#6D4AFF"
                        stopOpacity="0.2"
                      />
                    </radialGradient>
                    <radialGradient id="ringGrad" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#1677FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6D4AFF" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {[160, 130, 100].map((r, i) => (
                    <circle
                      key={i}
                      cx="200"
                      cy="200"
                      r={r}
                      fill="none"
                      stroke={
                        i === 0
                          ? "rgba(109,74,255,0.2)"
                          : i === 1
                            ? "rgba(22,119,255,0.25)"
                            : "rgba(0,200,255,0.3)"
                      }
                      strokeWidth="1"
                      strokeDasharray={
                        i === 0 ? "4 8" : i === 1 ? "2 6" : "none"
                      }
                    />
                  ))}
                  <polygon
                    points="200,140 251,170 251,230 200,260 149,230 149,170"
                    fill="url(#coreGrad)"
                    filter="url(#glow)"
                  />
                  <polygon
                    points="200,140 251,170 251,230 200,260 149,230 149,170"
                    fill="none"
                    stroke="rgba(0,200,255,0.6)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="200,160 231,178 231,222 200,240 169,222 169,178"
                    fill="rgba(8,13,24,0.7)"
                  />
                  <text
                    x="200"
                    y="205"
                    textAnchor="middle"
                    fill="#00C8FF"
                    fontSize="22"
                    fontWeight="900"
                    fontFamily="JetBrains Mono"
                  >
                    ₿
                  </text>
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    const cx = 200 + 155 * Math.cos(rad)
                    const cy = 200 + 155 * Math.sin(rad)
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={i % 2 === 0 ? 4 : 2.5}
                        fill={
                          i % 3 === 0
                            ? "#00C8FF"
                            : i % 3 === 1
                              ? "#1677FF"
                              : "#6D4AFF"
                        }
                        filter="url(#glow)"
                      />
                    )
                  })}
                  {[0, 120, 240].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    const x2 = 200 + 155 * Math.cos(rad)
                    const y2 = 200 + 155 * Math.sin(rad)
                    return (
                      <line
                        key={i}
                        x1="200"
                        y1="200"
                        x2={x2}
                        y2={y2}
                        stroke="rgba(0,200,255,0.15)"
                        strokeWidth="1"
                      />
                    )
                  })}
                  <rect
                    x="60"
                    y="50"
                    width="130"
                    height="32"
                    rx="8"
                    fill="rgba(12,19,32,0.9)"
                    stroke="rgba(0,200,255,0.2)"
                    strokeWidth="1"
                  />
                  <text
                    x="75"
                    y="68"
                    fill="#A4AEC0"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    BTC/USDT
                  </text>
                  <text
                    x="145"
                    y="68"
                    fill="#00D084"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="JetBrains Mono"
                  >
                    +1.24%
                  </text>
                  <rect
                    x="220"
                    y="310"
                    width="120"
                    height="32"
                    rx="8"
                    fill="rgba(12,19,32,0.9)"
                    stroke="rgba(109,74,255,0.2)"
                    strokeWidth="1"
                  />
                  <text
                    x="235"
                    y="330"
                    fill="#A4AEC0"
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                  >
                    RANK #12/284
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative" style={{ background: "#080D18" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div
              className="text-xs font-semibold tracking-widest mb-3"
              style={{ color: "#00C8FF" }}
            >
              ENTER NOW
            </div>
            <h2
              className="font-black text-4xl tracking-tight"
              style={{ color: "#FFFFFF" }}
            >
              UPCOMING COMPETITIONS
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {COMPETITIONS.slice(0, 3).map((c) => (
              <CompetitionCard key={c.id} comp={c} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href={ROUTES.competitions}
              className="btn-ghost px-8 py-3 rounded-xl text-sm"
            >
              View All Competitions →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: "#0C1320" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2
              className="font-black text-4xl tracking-tight"
              style={{ color: "#FFFFFF" }}
            >
              HOW IT WORKS
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < 5 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(0,200,255,0.3), transparent)",
                    }}
                  />
                )}
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 text-2xl"
                  style={{
                    background: "rgba(22,119,255,0.1)",
                    border: "1px solid rgba(0,200,255,0.15)",
                  }}
                >
                  {step.icon}
                </div>
                <div
                  className="text-xs font-mono mb-1"
                  style={{ color: "#00C8FF" }}
                >
                  {step.n}
                </div>
                <div className="font-bold text-sm" style={{ color: "#E5EAF3" }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: "#080D18" }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2
              className="font-black text-4xl tracking-tight"
              style={{ color: "#FFFFFF" }}
            >
              WHY COINX
            </h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-5 card-hover text-center"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <div
                  className="font-bold text-sm mb-2"
                  style={{ color: "#E5EAF3" }}
                >
                  {f.title}
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: "#A4AEC0" }}
                >
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="py-12"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "#080D18",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href={ROUTES.landing}>
            <Image
              src="/coinx-logo-long.png"
              alt="COINX"
              width={110}
              height={20}
              style={{ width: "110px", height: "auto" }}
            />
          </Link>
          <div
            className="flex items-center gap-6 text-xs"
            style={{ color: "#A4AEC0" }}
          >
            {["Terms", "Privacy", "Support", "API"].map((l) => (
              <a
                key={l}
                href="#"
                className="hover:text-white transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="text-xs" style={{ color: "#A4AEC0" }}>
            © 2026 CoinX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
