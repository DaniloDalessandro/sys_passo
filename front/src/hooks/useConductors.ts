"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/context/AuthContext"

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
      formData.append("street", conductorData.street)
      formData.append("number", conductorData.number)
      formData.append("neighborhood", conductorData.neighborhood)
      formData.append("city", conductorData.city)
      formData.append("gender", conductorData.gender)
      formData.append("nationality", conductorData.nationality)

      if (conductorData.reference_point) {
        formData.append("reference_point", conductorData.reference_point)
      }

      if (conductorData.whatsapp) {
        formData.append("whatsapp", conductorData.whatsapp)
      }

      if (conductorData.document) {
        formData.append("document", conductorData.document)
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
          } else if ((key === 'document' || key === 'cnh_digital') && value instanceof File) {
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

  const checkDuplicateField = async (
    field: 'cpf' | 'email' | 'license_number',
    value: string,
    excludeId?: number
  ): Promise<{
    exists: boolean;
    message?: string;
    duplicateConductor?: {
      id: number;
      name: string;
      cpf: string;
      email: string;
      license_number: string;
      is_active: boolean;
    };
  }> => {
    if (!accessToken) throw new Error("Token de acesso não encontrado")

    try {
      const params = new URLSearchParams({
        field,
        value: value.trim(),
      })

      if (excludeId) {
        params.append('exclude_id', excludeId.toString())
      }

      const response = await fetch(`${API_BASE_URL}/conductors/check-duplicate/?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao verificar duplicatas")
      }

      const data = await response.json()
      return {
        exists: data.exists,
        message: data.message,
        duplicateConductor: data.duplicate_conductor
      }
    } catch (err) {
      console.error("Error checking duplicate field:", err)
      // Return false for duplicates on error to avoid blocking form submission
      return { exists: false }
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
    checkDuplicateField,
  }
}