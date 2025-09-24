"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/context/AuthContext"

export interface Conductor {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  photo?: string
  birth_date?: string
  license_number: string
  license_category: string
  license_expiry_date: string
  address: string
  gender: 'M' | 'F' | 'O'
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
}

export interface ConductorFormData {
  name: string
  cpf: string
  email: string
  phone: string
  photo?: File | null
  birth_date: Date
  license_number: string
  license_category: string
  license_expiry_date: Date
  address: string
  gender: 'M' | 'F' | 'O'
  nationality: string
  whatsapp: string
  cnh_digital?: File | null
  is_active: boolean
}

const API_BASE_URL = "http://localhost:8000/api"

export function useConductors() {
  const [conductors, setConductors] = useState<Conductor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuthContext()

  const fetchConductors = async () => {
    if (!accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/conductors/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar condutores")
      }

      const data = await response.json()
      setConductors(data.results || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const createConductor = async (conductorData: ConductorFormData): Promise<Conductor> => {
    if (!accessToken) throw new Error("Token de acesso não encontrado")

    setError(null)

    try {
      const formData = new FormData()

      // Adicionar dados do formulário
      formData.append("name", conductorData.name)
      formData.append("cpf", conductorData.cpf)
      formData.append("email", conductorData.email)
      formData.append("license_number", conductorData.license_number)
      formData.append("license_category", conductorData.license_category)
      formData.append("birth_date", conductorData.birth_date.toISOString().split('T')[0])
      formData.append("license_expiry_date", conductorData.license_expiry_date.toISOString().split('T')[0])
      formData.append("is_active", conductorData.is_active.toString())

      formData.append("phone", conductorData.phone)
      formData.append("address", conductorData.address)
      formData.append("gender", conductorData.gender)
      formData.append("nationality", conductorData.nationality)

      if (conductorData.whatsapp) {
        formData.append("whatsapp", conductorData.whatsapp)
      }

      if (conductorData.photo) {
        formData.append("photo", conductorData.photo)
      }

      if (conductorData.cnh_digital) {
        formData.append("cnh_digital", conductorData.cnh_digital)
      }

      const response = await fetch(`${API_BASE_URL}/conductors/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao criar condutor")
      }

      const newConductor = await response.json()
      setConductors(prev => [...prev, newConductor])
      return newConductor
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateConductor = async (id: number, conductorData: Partial<ConductorFormData>): Promise<Conductor> => {
    if (!accessToken) throw new Error("Token de acesso não encontrado")

    setError(null)

    try {
      const formData = new FormData()

      // Adicionar dados do formulário
      Object.entries(conductorData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'birth_date' || key === 'license_expiry_date') {
            if (value instanceof Date) {
              formData.append(key, value.toISOString().split('T')[0])
            }
          } else if (key === 'is_active') {
            formData.append(key, value.toString())
          } else if ((key === 'photo' || key === 'cnh_digital') && value instanceof File) {
            formData.append(key, value)
          } else if (typeof value === 'string') {
            formData.append(key, value)
          }
        }
      })

      const response = await fetch(`${API_BASE_URL}/conductors/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao atualizar condutor")
      }

      const updatedConductor = await response.json()
      setConductors(prev =>
        prev.map(conductor =>
          conductor.id === id ? updatedConductor : conductor
        )
      )
      return updatedConductor
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteConductor = async (id: number): Promise<void> => {
    if (!accessToken) throw new Error("Token de acesso não encontrado")

    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/conductors/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao excluir condutor")
      }

      setConductors(prev => prev.filter(conductor => conductor.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getConductor = async (id: number): Promise<Conductor> => {
    if (!accessToken) throw new Error("Token de acesso não encontrado")

    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/conductors/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

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

  // Carregar condutores ao montar o componente
  useEffect(() => {
    fetchConductors()
  }, [accessToken])

  return {
    conductors,
    isLoading,
    error,
    fetchConductors,
    createConductor,
    updateConductor,
    deleteConductor,
    getConductor,
  }
}