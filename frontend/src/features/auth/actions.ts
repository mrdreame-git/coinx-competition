"use server"

import { cookies } from "next/headers"
import { SESSION_COOKIE } from "@/features/auth/session"

export async function loginAction() {
  const store = await cookies()
  store.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  })
}

export async function logoutAction() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
