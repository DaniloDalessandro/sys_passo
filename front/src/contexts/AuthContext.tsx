"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import { jwtDecode } from "jwt-decode"
import { buildApiUrl } from "@/lib/api-client"

export interface UserProfile {
  is_email_verified: boolean
  email_verified_at: string | null
}

export type UserRole = 'admin' | 'approver' | 'viewer'

export interface UserData {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role?: UserRole
  date_joined?: string
  last_login?: string | null
  is_active?: boolean
  profile?: UserProfile
}

export interface AuthContextType {
  user: UserData | null
  accessToken: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  canApprove: boolean
  canAdmin: boolean
  login: (data: { access: string; refresh: string; user: UserData }) => void
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getRoleFromToken(token: string): UserRole | null {
  try {
    const decoded = jwtDecode<{ role?: UserRole }>(token)
    return decoded.role ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cache por instância (useRef) para evitar leituras repetidas do localStorage
  const authDataCache = useRef<{ token: string | null; userData: UserData | null; timestamp: number } | null>(null)
  const CACHE_DURATION = 5000 // 5 segundos

  const getAuthData = useCallback(() => {
    const now = Date.now()

    if (authDataCache.current && (now - authDataCache.current.timestamp) < CACHE_DURATION) {
      return authDataCache.current
    }

    try {
      const token = localStorage.getItem("access_token")
      const tokenRole = token ? getRoleFromToken(token) : null
      const userData = {
        id: localStorage.getItem("user_id") || '',
        email: localStorage.getItem("user_email") || '',
        username: localStorage.getItem("user_username") || '',
        first_name: localStorage.getItem("user_first_name") || '',
        last_name: localStorage.getItem("user_last_name") || '',
        role: (tokenRole ?? (localStorage.getItem("user_role") as UserRole | null) ?? undefined),
      }

      const result = {
        token,
        userData: token && userData.id ? userData : null,
        timestamp: now
      }

      authDataCache.current = result
      return result
    } catch (error) {
      console.error("Error reading auth data", error)
      return { token: null, userData: null, timestamp: now }
    }
  }, [CACHE_DURATION])

  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded = jwtDecode<{ exp: number }>(token)
      return decoded.exp < Date.now() / 1000
    } catch {
      return true
    }
  }, [])

  const login = useCallback((data: { access: string; refresh: string; user: UserData }) => {
    try {
      const tokenRole = getRoleFromToken(data.access)
      const writes: [string, string][] = [
        ["access_token", data.access],
        ["refresh", data.refresh],
        ["user_id", data.user.id],
        ["user_email", data.user.email],
        ["user_username", data.user.username],
        ["user_first_name", data.user.first_name],
        ["user_last_name", data.user.last_name],
        ["user_role", tokenRole ?? data.user.role ?? 'viewer'],
      ]

      writes.forEach(([key, value]) => localStorage.setItem(key, value))

      const cookieOptions = "; path=/; SameSite=strict"
      document.cookie = `access=${data.access}${cookieOptions}`
      document.cookie = `refresh=${data.refresh}${cookieOptions}`

      const resolvedRole = (tokenRole ?? data.user.role ?? 'viewer') as UserRole
      setAccessToken(data.access)
      setUser({ ...data.user, role: resolvedRole })
      setRole(resolvedRole)
      setError(null)
      authDataCache.current = null
    } catch (error) {
      setError("Failed to save authentication data")
      console.error("Login error:", error)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      const keys = ["access_token", "refresh", "user_id", "user_email", "user_username", "user_first_name", "user_last_name", "user_role"]
      keys.forEach(key => localStorage.removeItem(key))

      const expireDate = "Thu, 01 Jan 1970 00:00:01 GMT"
      document.cookie = `access=; path=/; expires=${expireDate}`
      document.cookie = `refresh=; path=/; expires=${expireDate}`

      setAccessToken(null)
      setUser(null)
      setRole(null)
      setError(null)
      authDataCache.current = null
    } catch (error) {
      setError("Failed to clear authentication data")
      console.error("Logout error:", error)
    }
  }, [])

  const tokenExpiringSoon = useMemo(() => {
    return (token: string, thresholdSeconds = 300): boolean => {
      try {
        const decoded = jwtDecode<{ exp: number }>(token)
        const now = Math.floor(Date.now() / 1000)
        return decoded.exp - now < thresholdSeconds
      } catch {
        return true
      }
    }
  }, [])

  // Sem dependências no array para evitar loops infinitos com o interceptor
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refresh = localStorage.getItem("refresh")
    if (!refresh) {
      try {
        const keys = ["access_token", "refresh", "user_id", "user_email", "user_username", "user_first_name", "user_last_name"]
        keys.forEach(key => localStorage.removeItem(key))

        const expireDate = "Thu, 01 Jan 1970 00:00:01 GMT"
        document.cookie = `access=; path=/; expires=${expireDate}`
        document.cookie = `refresh=; path=/; expires=${expireDate}`

        setAccessToken(null)
        setUser(null)
        setError(null)
        authDataCache.current = null
      } catch (error) {
        console.error("Logout error:", error)
      }
      return false
    }

    try {
      setIsLoading(true)
      const response = await fetch(buildApiUrl("/api/auth/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })

      if (!response.ok) throw new Error("Refresh failed")

      const data = await response.json()
      const newRole = getRoleFromToken(data.access)
      localStorage.setItem("access_token", data.access)
      if (newRole) localStorage.setItem("user_role", newRole)
      setAccessToken(data.access)
      setRole(newRole)
      setError(null)
      authDataCache.current = null
      return true
    } catch (error) {
      setError("Session expired. Please login again.")
      try {
        const keys = ["access_token", "refresh", "user_id", "user_email", "user_username", "user_first_name", "user_last_name"]
        keys.forEach(key => localStorage.removeItem(key))

        const expireDate = "Thu, 01 Jan 1970 00:00:01 GMT"
        document.cookie = `access=; path=/; expires=${expireDate}`
        document.cookie = `refresh=; path=/; expires=${expireDate}`

        setAccessToken(null)
        setUser(null)
        setError(null)
        authDataCache.current = null
      } catch (error) {
        console.error("Logout error:", error)
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let hasInitialized = false

    const initializeAuth = async () => {
      if (hasInitialized) return
      hasInitialized = true

      try {
        const { token, userData } = getAuthData()

        if (!isMounted) return

        if (token && userData) {
          if (isTokenExpired(token)) {
            const refreshed = await refreshAccessToken()
            if (!refreshed || !isMounted) return
          } else {
            const tokenRole = getRoleFromToken(token)
            setAccessToken(token)
            setRole(tokenRole)
            setUser({ ...userData, role: tokenRole ?? undefined })
          }
        }
      } catch (error) {
        if (isMounted) {
          setError("Failed to initialize authentication")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincroniza estado entre abas do navegador
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token") {
        authDataCache.current = null
        try {
          const token = localStorage.getItem("access_token")
          const userData = {
            id: localStorage.getItem("user_id") || '',
            email: localStorage.getItem("user_email") || '',
            username: localStorage.getItem("user_username") || '',
            first_name: localStorage.getItem("user_first_name") || '',
            last_name: localStorage.getItem("user_last_name") || '',
          }
          const tokenRole = token ? getRoleFromToken(token) : null
          setAccessToken(token)
          setRole(tokenRole)
          setUser(token && userData.id ? { ...userData, role: tokenRole ?? undefined } : null)
        } catch (error) {
          console.error("Error reading auth data on storage change", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const contextValue = useMemo(() => ({
    user,
    accessToken,
    role,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
    canApprove: role === 'admin' || role === 'approver',
    canAdmin: role === 'admin',
    login,
    logout,
    refreshAccessToken,
  }), [user, accessToken, role, isLoading, error, login, logout, refreshAccessToken])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
