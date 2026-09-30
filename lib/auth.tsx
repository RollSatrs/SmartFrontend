"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { authApi } from "@/lib/services"
import type { AuthUser } from "@/lib/types"

type AuthState = {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
}

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"]

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // На страницах входа пользователя заведомо нет: не делаем лишний запрос, который даёт 401 в консоли.
  const [loading, setLoading] = useState(() => typeof window === "undefined" || !AUTH_PAGES.some((p) => window.location.pathname.startsWith(p)))

  useEffect(() => {
    if (!loading) return
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
    // Сессию проверяем один раз при открытии сайта.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    window.location.href = "/login"
  }, [])

  const value = useMemo(() => ({ user, loading, setUser, logout }), [user, loading, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth нужно вызывать внутри AuthProvider")
  return context
}

export const homeFor = (role: AuthUser["role"]) => (role === "resident" ? "/resident" : "/gov")
