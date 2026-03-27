"use client"

import { useState, useCallback } from "react"
import { authFetch, buildApiUrl } from "@/lib/api-client"

export type UserRole = 'admin' | 'approver' | 'viewer'

export interface SystemUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
  last_login: string | null
  role: UserRole
  is_email_verified: boolean
}

export interface CreateUserFormData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role: UserRole
}

export interface UpdateUserData {
  role?: UserRole
  is_active?: boolean
  first_name?: string
  last_name?: string
}

interface FetchParams {
  search?: string
  role?: string
  is_active?: string
}

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (params: FetchParams = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.is_active) queryParams.append('is_active', params.is_active)

      const response = await authFetch(buildApiUrl(`api/auth/users/?${queryParams}`))
      if (!response.ok) throw new Error("Erro ao carregar usuários")
      const data = await response.json()
      setUsers(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createUser = useCallback(async (userData: CreateUserFormData): Promise<SystemUser> => {
    const response = await authFetch(buildApiUrl("api/auth/users/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.details ? Object.values(err.details).flat().join(" ") : err.error || "Erro ao criar usuário")
    }
    return response.json()
  }, [])

  const updateUser = useCallback(async (id: number, data: UpdateUserData): Promise<SystemUser> => {
    const response = await authFetch(buildApiUrl(`api/auth/users/${id}/`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || "Erro ao atualizar usuário")
    }
    return response.json()
  }, [])

  return { users, totalCount, isLoading, error, fetchUsers, createUser, updateUser }
}
