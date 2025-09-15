"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { jwtDecode } from "jwt-decode"

interface UserData {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: UserData | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (data: { access: string; refresh: string; user: UserData }) => void
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache para evitar múltiplas leituras do localStorage
let authDataCache: { token: string | null; userData: UserData | null; timestamp: number } | null = null
const CACHE_DURATION = 5000 // 5 segundos de cache

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Centraliza a leitura dos dados de autenticação com cache
  const getAuthData = useCallback(() => {
    const now = Date.now()
    
    // Use cache se ainda está válido
    if (authDataCache && (now - authDataCache.timestamp) < CACHE_DURATION) {
      return authDataCache
    }

    try {
      const token = localStorage.getItem("access")
      const userData = {
        id: localStorage.getItem("user_id") || '',
        email: localStorage.getItem("user_email") || '',
        name: localStorage.getItem("user_name") || '',
      }
      
      const result = { 
        token,
        userData: token && userData.id ? userData : null,
        timestamp: now
      }
      
      // Atualiza o cache
      authDataCache = result
      return result
    } catch (error) {
      console.error("Error reading auth data", error)
      return { token: null, userData: null, timestamp: now }
    }
  }, [])

  // Verifica se o token está expirado (memoized)
  const isTokenExpired = useMemo(() => {
    return (token: string): boolean => {
      try {
        const decoded = jwtDecode<{ exp: number }>(token)
        return decoded.exp < Date.now() / 1000
      } catch {
        return true
      }
    }
  }, [])

  // Função de login otimizada
  const login = useCallback((data: { access: string; refresh: string; user: UserData }) => {
    try {
      // Batch localStorage writes
      const writes = [
        ["access", data.access],
        ["refresh", data.refresh],
        ["user_id", data.user.id],
        ["user_email", data.user.email],
        ["user_name", data.user.name]
      ]
      
      writes.forEach(([key, value]) => localStorage.setItem(key, value))

      // Set cookies
      const cookieOptions = "; path=/; SameSite=strict"
      document.cookie = `access=${data.access}${cookieOptions}`
      document.cookie = `refresh=${data.refresh}${cookieOptions}`

      setAccessToken(data.access)
      setUser(data.user)
      setError(null)
      
      // Invalidate cache
      authDataCache = null
    } catch (error) {
      setError("Failed to save authentication data")
      console.error("Login error:", error)
    }
  }, [])

  // Função de logout otimizada
  const logout = useCallback(() => {
    try {
      const keys = ["access", "refresh", "user_id", "user_email", "user_name"]
      keys.forEach(key => localStorage.removeItem(key))

      // Clear cookies
      const expireDate = "Thu, 01 Jan 1970 00:00:01 GMT"
      document.cookie = `access=; path=/; expires=${expireDate}`
      document.cookie = `refresh=; path=/; expires=${expireDate}`

      setAccessToken(null)
      setUser(null)
      setError(null)
      
      // Invalidate cache
      authDataCache = null
    } catch (error) {
      setError("Failed to clear authentication data")
      console.error("Logout error:", error)
    }
  }, [])

  // Verifica se o token está prestes a expirar
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

  // Refresh token com debouncing para evitar múltiplas chamadas
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refresh = localStorage.getItem("refresh")
    if (!refresh) {
      logout()
      return false
    }

    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:8000/api/v1/accounts/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })

      if (!response.ok) throw new Error("Refresh failed")

      const data = await response.json()
      localStorage.setItem("access", data.access)
      setAccessToken(data.access)
      setError(null)
      
      // Invalidate cache
      authDataCache = null
      return true
    } catch (error) {
      setError("Session expired. Please login again.")
      logout()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  // Inicialização otimizada
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const { token, userData } = getAuthData()
        
        if (!isMounted) return
        
        if (token && userData) {
          if (isTokenExpired(token)) {
            const refreshed = await refreshAccessToken()
            if (!refreshed || !isMounted) return
          } else {
            setAccessToken(token)
            setUser(userData)
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
  }, [getAuthData, isTokenExpired, refreshAccessToken])

  // Verificação periódica do token otimizada (menos frequente)
  useEffect(() => {
    if (!accessToken) return

    const interval = setInterval(async () => {
      if (accessToken && tokenExpiringSoon(accessToken)) {
        await refreshAccessToken()
      }
    }, 60 * 1000) // Verifica a cada 60 segundos (menos agressivo)

    return () => clearInterval(interval)
  }, [accessToken, tokenExpiringSoon, refreshAccessToken])

  // Sincronização entre abas otimizada
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access") {
        // Invalidate cache primeiro
        authDataCache = null
        const { token, userData } = getAuthData()
        setAccessToken(token)
        setUser(userData)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [getAuthData])

  // Memoize o valor do contexto para evitar re-renderizações
  const contextValue = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
    login,
    logout,
    refreshAccessToken,
  }), [user, accessToken, isLoading, error, login, logout, refreshAccessToken])

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