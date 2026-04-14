"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
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
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  canApprove: boolean
  canAdmin: boolean
  login: (data: { user: UserData }) => void
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_DATA_KEYS = [
  "user_id", "user_email", "user_username",
  "user_first_name", "user_last_name", "user_role",
]

function saveUserToStorage(user: UserData): void {
  try {
    localStorage.setItem("user_id", user.id)
    localStorage.setItem("user_email", user.email)
    localStorage.setItem("user_username", user.username)
    localStorage.setItem("user_first_name", user.first_name)
    localStorage.setItem("user_last_name", user.last_name)
    if (user.role) localStorage.setItem("user_role", user.role)
  } catch {
    // Ignora erros do localStorage (ex.: modo privado bloqueando acesso ao storage)
  }
}

function loadUserFromStorage(): UserData | null {
  try {
    const id = localStorage.getItem("user_id")
    if (!id) return null
    return {
      id,
      email: localStorage.getItem("user_email") || '',
      username: localStorage.getItem("user_username") || '',
      first_name: localStorage.getItem("user_first_name") || '',
      last_name: localStorage.getItem("user_last_name") || '',
      role: (localStorage.getItem("user_role") as UserRole | null) ?? undefined,
    }
  } catch {
    return null
  }
}

function clearUserFromStorage(): void {
  try {
    USER_DATA_KEYS.forEach(key => localStorage.removeItem(key))
  } catch {
    // Ignora erros do localStorage (ex.: modo privado bloqueando acesso ao storage)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback((data: { user: UserData }) => {
    try {
      const resolvedRole = data.user.role ?? 'viewer'
      const userData = { ...data.user, role: resolvedRole as UserRole }
      saveUserToStorage(userData)
      setUser(userData)
      setRole(resolvedRole as UserRole)
      setError(null)
    } catch (err) {
      setError("Erro ao salvar dados de autenticação")
      console.error("Login error:", err)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      clearUserFromStorage()
      setUser(null)
      setRole(null)
      setError(null)
    } catch (err) {
      setError("Erro ao limpar dados de autenticação")
      console.error("Logout error:", err)
    }
  }, [])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(buildApiUrl("/api/auth/refresh/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!response.ok) throw new Error("Refresh failed")

      // Após o refresh, o backend renova os cookies HttpOnly;
      // busca os dados atualizados do usuário para manter o estado sincronizado
      const userResponse = await fetch(buildApiUrl("/api/auth/user-info/"), {
        credentials: "include",
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.user) {
          const resolvedRole = userData.user.role ?? 'viewer'
          const updatedUser = { ...userData.user, role: resolvedRole as UserRole }
          saveUserToStorage(updatedUser)
          setUser(updatedUser)
          setRole(resolvedRole as UserRole)
        }
      }

      setError(null)
      return true
    } catch (err) {
      setError("Sessão expirada. Faça login novamente.")
      clearUserFromStorage()
      setUser(null)
      setRole(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Inicializa o estado de autenticação verificando o backend; restaura dados do localStorage para evitar flash de tela vazia
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      // Restaura dados do localStorage imediatamente para evitar tela em branco durante a verificação
      const storedUser = loadUserFromStorage()
      if (storedUser && isMounted) {
        setUser(storedUser)
        setRole(storedUser.role ?? null)
      }

      // Confirma autenticidade com o backend via cookie HttpOnly
      try {
        const response = await fetch(buildApiUrl("/api/auth/user-info/"), {
          credentials: "include",
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            const resolvedRole = data.user.role ?? 'viewer'
            const userData = { ...data.user, role: resolvedRole as UserRole }
            saveUserToStorage(userData)
            setUser(userData)
            setRole(resolvedRole as UserRole)
          }
        } else if (response.status === 401) {
          const refreshed = await refreshAccessToken()
          if (!refreshed && isMounted) {
            clearUserFromStorage()
            setUser(null)
            setRole(null)
          }
        }
      } catch (err) {
        if (isMounted) {
          // Erro de rede: mantém dados armazenados em vez de forçar logout
          console.error("Auth init error:", err)
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

  // Sincroniza o estado de autenticação entre abas via evento de storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_id") {
        const storedUser = loadUserFromStorage()
        setUser(storedUser)
        setRole(storedUser?.role ?? null)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const contextValue = useMemo(() => ({
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    error,
    canApprove: role === 'admin' || role === 'approver',
    canAdmin: role === 'admin',
    login,
    logout,
    refreshAccessToken,
  }), [user, role, isLoading, error, login, logout, refreshAccessToken])

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
