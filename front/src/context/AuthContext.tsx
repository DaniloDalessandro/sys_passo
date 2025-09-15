"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Centraliza a leitura dos dados de autenticação
  const getAuthData = useCallback(() => {
    try {
      const token = localStorage.getItem("access")
      const userData = {
        id: localStorage.getItem("user_id") || '',
        email: localStorage.getItem("user_email") || '',
        name: localStorage.getItem("user_name") || '',
      }
      
      return { 
        token,
        userData: token && userData.id ? userData : null 
      }
    } catch (error) {
      console.error("Error reading auth data", error)
      return { token: null, userData: null }
    }
  }, [])

  // ✅ Verifica se o token está expirado
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded = jwtDecode<{ exp: number }>(token)
      return decoded.exp < Date.now() / 1000
    } catch {
      return true
    }
  }, [])

  // ✅ Função de login otimizada
  const login = useCallback((data: { access: string; refresh: string; user: UserData }) => {
    try {
      localStorage.setItem("access", data.access)
      localStorage.setItem("refresh", data.refresh)
      localStorage.setItem("user_id", data.user.id)
      localStorage.setItem("user_email", data.user.email)
      localStorage.setItem("user_name", data.user.name)

      // Also set cookies for server-side access
      document.cookie = `access=${data.access}; path=/; SameSite=strict`
      document.cookie = `refresh=${data.refresh}; path=/; SameSite=strict`

      setAccessToken(data.access)
      setUser(data.user)
      setError(null)
    } catch (error) {
      setError("Failed to save authentication data")
      console.error("Login error:", error)
    }
  }, [])

  // ✅ Função de logout otimizada
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("access")
      localStorage.removeItem("refresh")
      localStorage.removeItem("user_id")
      localStorage.removeItem("user_email")
      localStorage.removeItem("user_name")

      // Clear cookies
      document.cookie = 'access=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      setAccessToken(null)
      setUser(null)
      setError(null)
    } catch (error) {
      setError("Failed to clear authentication data")
      console.error("Logout error:", error)
    }
  }, [])

  // ✅ Verifica se o token está prestes a expirar
  const tokenExpiringSoon = useCallback((token: string, thresholdSeconds = 300): boolean => {
    try {
      const decoded = jwtDecode<{ exp: number }>(token)
      const now = Math.floor(Date.now() / 1000)
      return decoded.exp - now < thresholdSeconds
    } catch {
      return true
    }
  }, [])

  // ✅ Refresh token com tratamento de erros melhorado
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refresh = localStorage.getItem("refresh")
    if (!refresh) {
      logout()
      return false
    }

    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:8000/api/auth/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })

      if (!response.ok) throw new Error("Refresh failed")

      const data = await response.json()
      localStorage.setItem("access", data.access)
      setAccessToken(data.access)
      setError(null)
      return true
    } catch (error) {
      setError("Session expired. Please login again.")
      logout()
      return false
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  // ✅ Inicialização com verificação de token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { token, userData } = getAuthData()
        
        if (token && userData) {
          if (isTokenExpired(token)) {
            const refreshed = await refreshAccessToken()
            if (!refreshed) return
          } else {
            setAccessToken(token)
            setUser(userData)
          }
        }
      } catch (error) {
        setError("Failed to initialize authentication")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [getAuthData, isTokenExpired, refreshAccessToken])

  // ✅ Verificação periódica do token
  useEffect(() => {
    if (!accessToken) return

    const interval = setInterval(async () => {
      if (accessToken && tokenExpiringSoon(accessToken)) {
        await refreshAccessToken()
      }
    }, 30 * 1000) // Verifica a cada 30 segundos

    return () => clearInterval(interval)
  }, [accessToken, tokenExpiringSoon, refreshAccessToken])

  // ✅ Sincronização entre abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access") {
        const { token, userData } = getAuthData()
        setAccessToken(token)
        setUser(userData)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [getAuthData])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        error,
        login,
        logout,
        refreshAccessToken,
      }}
    >
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