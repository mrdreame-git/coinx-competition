"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ROUTES } from "@/config/app"
import Orbs from "@/components/common/Orbs"

type Step = "form" | "verify" | "verified"

const FIELDS = [
  { label: "EMAIL", placeholder: "trader@coinx.io", type: "email" },
  { label: "USERNAME", placeholder: "TraderPro", type: "text" },
  { label: "PASSWORD", placeholder: "••••••••", type: "password" },
  { label: "CONFIRM PASSWORD", placeholder: "••••••••", type: "password" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [email, setEmail] = useState("trader@coinx.io")

  if (step === "verified") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080D18" }}
      >
        <Orbs />
        <div className="relative z-10 text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(0,208,132,0.15)",
              border: "2px solid rgba(0,208,132,0.4)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D084"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-black text-3xl mb-2" style={{ color: "#FFFFFF" }}>
            EMAIL VERIFIED
          </h2>
          <p className="mb-8" style={{ color: "#A4AEC0" }}>
            Account successfully created. Welcome to CoinX!
          </p>
          <button
            onClick={() => router.push(ROUTES.login)}
            className="btn-cyan px-8 py-3.5 rounded-xl font-bold"
          >
            CONTINUE TO LOGIN
          </button>
        </div>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080D18" }}
      >
        <Orbs />
        <div className="relative z-10 text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(22,119,255,0.12)",
              border: "1px solid rgba(0,200,255,0.3)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00C8FF"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="font-black text-3xl mb-2" style={{ color: "#FFFFFF" }}>
            VERIFY YOUR EMAIL
          </h2>
          <p className="mb-2" style={{ color: "#A4AEC0" }}>
            We've sent a verification link to:
          </p>
          <p
            className="font-mono text-sm mb-8 px-4 py-2 rounded-xl inline-block"
            style={{ background: "rgba(255,255,255,0.04)", color: "#00C8FF" }}
          >
            {email}
          </p>
          <div className="flex gap-3 justify-center">
            <button className="btn-ghost px-6 py-3 rounded-xl text-sm">
              RESEND EMAIL
            </button>
            <button
              onClick={() => setStep("verified")}
              className="btn-primary px-6 py-3 rounded-xl text-sm"
            >
              SIMULATE VERIFY →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#080D18" }}
    >
      <Orbs variant="hero" />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href={ROUTES.landing}
          className="flex items-center gap-2 mb-8"
        >
          <Image
            src="/coinx-logo-long.png"
            alt="COINX"
            width={130}
            height={24}
            priority
            style={{ width: "130px", height: "auto" }}
          />
        </Link>
        <div className="glass rounded-2xl p-8">
          <h1 className="font-black text-2xl mb-1" style={{ color: "#FFFFFF" }}>
            CREATE ACCOUNT
          </h1>
          <p className="text-sm mb-8" style={{ color: "#A4AEC0" }}>
            Start competing in minutes
          </p>
          <div className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.label}>
                <label
                  className="text-xs font-semibold mb-1.5 block"
                  style={{ color: "#A4AEC0" }}
                >
                  {f.label}
                </label>
                <input
                  type={f.type}
                  className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  placeholder={f.placeholder}
                  onChange={
                    f.label === "EMAIL"
                      ? (e) => setEmail(e.target.value)
                      : undefined
                  }
                />
              </div>
            ))}
            <button
              onClick={() => setStep("verify")}
              className="btn-cyan w-full py-3.5 rounded-xl text-sm font-bold mt-2"
            >
              CREATE ACCOUNT
            </button>
          </div>
          <p className="text-center text-sm mt-6" style={{ color: "#A4AEC0" }}>
            Already have an account?{" "}
            <Link
              href={ROUTES.login}
              style={{ color: "#00C8FF" }}
              className="font-semibold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
