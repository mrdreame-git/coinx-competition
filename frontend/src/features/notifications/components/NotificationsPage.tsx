"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import { NOTIFICATIONS as MOCK_NOTIFICATIONS } from "@/mocks/notifications"
import type { AppNotification } from "@/types/notification"

export default function NotificationsPage() {
  const [notes, setNotes] = useState<AppNotification[]>(MOCK_NOTIFICATIONS)

  return (
    <div className="min-h-screen" style={{ background: "#080D18" }}>
      <Header notifCount={0} />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-black text-3xl" style={{ color: "#FFFFFF" }}>
            NOTIFICATIONS
          </h1>
          <button
            onClick={() => setNotes(notes.map((n) => ({ ...n, read: true })))}
            className="text-xs"
            style={{ color: "#00C8FF" }}
          >
            Mark all read
          </button>
        </div>
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <div className="font-bold" style={{ color: "#E5EAF3" }}>
                No notifications
              </div>
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="glass rounded-xl p-4 flex gap-4 cursor-pointer card-hover"
                style={{
                  borderColor: !n.read ? "rgba(0,200,255,0.15)" : undefined,
                }}
                onClick={() =>
                  setNotes(
                    notes.map((x) =>
                      x.id === n.id ? { ...x, read: true } : x,
                    ),
                  )
                }
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      n.type === "success"
                        ? "rgba(0,208,132,0.1)"
                        : n.type === "warning"
                          ? "rgba(255,176,32,0.1)"
                          : "rgba(22,119,255,0.1)",
                  }}
                >
                  <span>
                    {n.type === "success"
                      ? "✓"
                      : n.type === "warning"
                        ? "⚡"
                        : "ℹ"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "#E5EAF3" }}
                    >
                      {n.title}
                    </span>
                    {!n.read && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#00C8FF" }}
                      />
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#A4AEC0" }}>
                    {n.body}
                  </div>
                </div>
                <div className="text-xs shrink-0" style={{ color: "#A4AEC0" }}>
                  {n.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
