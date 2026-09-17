"use client"

import { useRouter } from "next/navigation"
import { ROUTES } from "@/config/app"
import Header from "@/components/layout/Header"
import { useAuth } from "@/features/auth/auth-context"
import { logoutAction } from "@/features/auth/actions"

const PROFILE_SECTIONS = [
  {
    section: "SECURITY",
    items: [
      ["2FA Authentication", "Enabled ✓"],
      ["Change Password", "→"],
      ["Active Sessions", "2 devices"],
      ["Withdrawal Security", "Email + 2FA"],
    ],
  },
  {
    section: "PREFERENCES",
    items: [
      ["Language", "English"],
      ["Currency Display", "USD"],
      ["Email Notifications", "Enabled"],
    ],
  },
  {
    section: "SUPPORT",
    items: [
      ["Help Center", "→"],
      ["Contact Support", "→"],
      ["Terms of Service", "→"],
      ["Privacy Policy", "→"],
    ],
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
            style={{
              background: "linear-gradient(135deg, #2563EB, #6D4AFF)",
              color: "white",
            }}
          >
            {user.initial}
          </div>
          <div className="flex-1">
            <div className="font-black text-xl" style={{ color: "#FFFFFF" }}>
              {user.name}
            </div>
            <div className="text-sm" style={{ color: "#A4AEC0" }}>
              {user.email}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "rgba(0,208,132,0.12)",
                  color: "#00D084",
                  border: "1px solid rgba(0,208,132,0.25)",
                }}
              >
                ✓ VERIFIED
              </div>
              <div
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: "rgba(22,119,255,0.1)",
                  color: "#00C8FF",
                  border: "1px solid rgba(0,200,255,0.2)",
                }}
              >
                KYC APPROVED
              </div>
            </div>
          </div>
        </div>

        {PROFILE_SECTIONS.map(({ section, items }) => (
          <div key={section} className="glass rounded-2xl p-5 mb-4">
            <div
              className="text-xs font-semibold mb-4"
              style={{ color: "#A4AEC0" }}
            >
              {section}
            </div>
            <div className="space-y-1">
              {items.map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between items-center py-2.5 rounded-xl px-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span className="text-sm" style={{ color: "#E5EAF3" }}>
                    {l}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: v.includes("✓")
                        ? "#00D084"
                        : v === "→"
                          ? "#00C8FF"
                          : "#A4AEC0",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={async () => {
            logout()
            await logoutAction()
            router.push(ROUTES.landing)
          }}
          className="w-full py-3.5 rounded-xl text-sm font-bold mt-2"
          style={{
            background: "rgba(255,77,103,0.08)",
            border: "1px solid rgba(255,77,103,0.2)",
            color: "#FF4D67",
          }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  )
}
