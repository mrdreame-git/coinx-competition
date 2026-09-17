"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ROUTES, DEMO_CREDENTIALS } from "@/config/app"
import Orbs from "@/components/common/Orbs"
import { useAuth } from "@/features/auth/auth-context"
import { loginAction } from "@/features/auth/actions"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("trader@coinx.io")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }
    await loginAction()
    login(email)
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#080D18" }}>
      <Orbs variant="hero" />
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href={ROUTES.landing} className="flex items-center gap-2 mb-8">
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
            <h1
              className="font-black text-2xl mb-1"
              style={{ color: "#FFFFFF" }}
            >
              WELCOME BACK
            </h1>
            <p className="text-sm mb-8" style={{ color: "#A4AEC0" }}>
              Sign in to your account
            </p>
            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-semibold mb-1.5 block"
                  style={{ color: "#A4AEC0" }}
                >
                  EMAIL
                </label>
                <input
                  className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="trader@coinx.io"
                  defaultValue={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "#A4AEC0" }}
                  >
                    PASSWORD
                  </label>
                  <a href="#" className="text-xs" style={{ color: "#00C8FF" }}>
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-xs" style={{ color: "#FF4D67" }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleSubmit}
                className="btn-primary w-full py-3.5 rounded-xl text-sm mt-2"
              >
                LOGIN
              </button>
            </div>
            <p
              className="text-center text-sm mt-6"
              style={{ color: "#A4AEC0" }}
            >
              Don't have an account?{" "}
              <Link
                href={ROUTES.register}
                style={{ color: "#00C8FF" }}
                className="font-semibold"
              >
                Register
              </Link>
            </p>
            <div
              className="mt-4 pt-4 text-center text-xs"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                color: "#A4AEC0",
              }}
            >
              Demo: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
            </div>
          </div>
        </div>
      </div>
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-8"
        style={{ background: "rgba(12,19,32,0.5)" }}
      >
        <div className="text-center">
          <div className="font-black text-5xl leading-tight mb-4">
            <span className="gradient-text">COMPETE.</span>
            <br />
            <span style={{ color: "#FFFFFF" }}>WIN.</span>
          </div>
          <p className="text-sm max-w-xs" style={{ color: "#A4AEC0" }}>
            Join 50,000+ traders competing for real crypto prizes every day.
          </p>
        </div>
      </div>
    </div>
  )
}
