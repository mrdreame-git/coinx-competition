import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE } from "@/features/auth/session"

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE)
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/leaderboard/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/competitions/:path*/lobby/:path*",
    "/competitions/:path*/trade/:path*",
    "/competitions/:path*/results/:path*"
  ]
}
