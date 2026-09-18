"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface User {
  name: string
  email: string
  initial: string
}

interface AuthContextValue {
  user: User
  login: (email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_USER: User = {
  name: "You",
  email: "demo@coinx.com",
  initial: "Y",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((email: string) => {
    setUser({ name: "You", email, initial: email.charAt(0).toUpperCase() })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user: user ?? MOCK_USER,
    login,
    logout,
    isAuthenticated: user !== null,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
