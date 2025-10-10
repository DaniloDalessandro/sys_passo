"use client"

import { useState, useCallback } from "react"

// Interfaces permanecem as mesmas...
export interface Vehicle {
  id: number
  modelo: string
  marca: string
  placa: string
  cor: string
}

export interface Conductor {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  photo?: string
  document?: string
  birth_date: string
  license_number: string
  license_category: string
  license_expiry_date: string
  address: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  reference_point?: string
  gender: 'M' | 'F' | 'O'
  gender_display: string
  nationality: string
  whatsapp?: string
  cnh_digital?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  created_by_username?: string
  updated_by_username?: string
  is_license_expired: boolean
  vehicles?: Vehicle[]
}

export interface ConductorFormData {
  name: string
  cpf: string
  email: string
  phone: string
  document?: File | null
  birth_date: Date
  license_number: string
  license_category: string
  license_expiry_date: Date
  street: string
  number: string
  neighborhood: string
  city: string
  reference_point?: string
  gender: 'M' | 'F' | 'O'
  nationality: string
  whatsapp: string
  cnh_digital?: File | null
  is_active: boolean
}

const API_BASE_URL = "http://localhost:8000/api"

// Parâmetros para a busca na API
interface FetchParams {
  page?: number
  pageSize?: number
  filters?: Record<string, any>
}

export function useConductors() {
  const [conductors, setConductors] = useState<Conductor[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConductors = useCallback(async (params: FetchParams = {}) => {
    setIsLoading(true)
    setError(null)

    const { page = 1, pageSize = 10, filters = {} } = params

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      // Adiciona filtros aos parâmetros da query
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${API_BASE_URL}/conductors/?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Erro ao carregar condutores")
      }

      const data = await response.json()
      setConductors(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      setConductors([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createConductor = async (conductorData: ConductorFormData): Promise<Conductor> => {
    setError(null)
    const formData = new FormData()
    Object.entries(conductorData).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, value.toISOString().split('T')[0])
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob)
      }
    })

    try {
      const response = await fetch(`${API_BASE_URL}/conductors/`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao criar condutor")
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateConductor = async (id: number, conductorData: Partial<ConductorFormData>): Promise<Conductor> => {
    setError(null)
    const formData = new FormData()
    Object.entries(conductorData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'birth_date' || key === 'license_expiry_date') {
            if (value instanceof Date) {
              formData.append(key, value.toISOString().split('T')[0])
            }
          } else if (key === 'is_active') {
            formData.append(key, value.toString())
          } else if ((key === 'document' || key === 'cnh_digital') && value instanceof File) {
            formData.append(key, value)
          } else if (typeof value === 'string') {
            formData.append(key, value)
          }
        }
      })

    try {
      const response = await fetch(`${API_BASE_URL}/conductors/${id}/`, {
        method: "PATCH",
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao atualizar condutor")
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteConductor = async (id: number): Promise<void> => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/conductors/${id}/`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao excluir condutor")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getConductor = async (id: number): Promise<Conductor> => {
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/conductors/${id}/`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao carregar condutor")
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const checkDuplicateField = async (
    field: 'cpf' | 'email' | 'license_number',
    value: string,
    excludeId?: number
  ): Promise<any> => {
    try {
      const params = new URLSearchParams({ field, value: value.trim() })
      if (excludeId) {
        params.append('exclude_id', excludeId.toString())
      }
      const response = await fetch(`${API_BASE_URL}/conductors/check-duplicate/?${params}`)
      if (!response.ok) {
        throw new Error("Erro ao verificar duplicatas")
      }
      return await response.json()
    } catch (err) {
      console.error("Error checking duplicate field:", err)
      return { exists: false }
    }
  }

  return {
    conductors,
    totalCount,
    isLoading,
    error,
    fetchConductors,
    createConductor,
    updateConductor,
    deleteConductor,
    getConductor,
    checkDuplicateField,
  }
}