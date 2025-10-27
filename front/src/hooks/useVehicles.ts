"use client"

import { useState, useCallback } from "react"
import { authFetch } from "@/lib/api-client"

export interface Vehicle {
  id: number;
  plate: string;
  placa: string;
  model: string;
  modelo: string;
  brand: string;
  marca: string;
  year: number;
  ano: number;
  color: string;
  cor: string;
  chassis_number: string;
  chassi: string;
  renavam: string;
  fuel_type: string;
  combustivel: string;
  passenger_capacity: number;
  capacidade: number;
  category: string;
  categoria: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  created_by_username?: string;
  updated_by_username?: string;
  status: 'ativo' | 'inativo';
  kmRodados?: number;
  proximaManutencao?: string;
  ultimaManutencao?: string;
  conductors?: any[];
  photo_1?: string | null;
  photo_2?: string | null;
  photo_3?: string | null;
  photo_4?: string | null;
  photo_5?: string | null;
}

export interface VehicleFormData {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  cor?: string;
  chassi?: string;
  renavam?: string;
  combustivel?: string;
  capacidade?: number;
  categoria?: string;
  status?: string;
  conductors?: string[];
  photo_1?: File | null;
  photo_2?: File | null;
  photo_3?: File | null;
  photo_4?: File | null;
  photo_5?: File | null;
}

const API_BASE_URL = "http://localhost:8000/api"

interface FetchParams {
  page?: number
  pageSize?: number
  filters?: Record<string, any>
}

export interface VehicleStats {
  total_vehicles: number
  active_vehicles: number
  inactive_vehicles: number
  old_vehicles: number
  electric_vehicles: number
  categories_stats: Record<string, number>
  fuel_type_stats: Record<string, number>
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<VehicleStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = useCallback(async (params: FetchParams = {}) => {
    setIsLoading(true)
    setError(null)

    const { page = 1, pageSize = 10, filters = {} } = params

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const url = `${API_BASE_URL}/vehicles/?${queryParams.toString()}`
      console.log('URL da requisição:', url)
      const response = await authFetch(url)

      if (!response.ok) {
        throw new Error("Erro ao carregar veículos")
      }

      const data = await response.json()
      console.log('Resposta da API:', {
        count: data.count,
        resultsLength: data.results?.length,
        firstResult: data.results?.[0]
      })
      setVehicles(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      setVehicles([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createVehicle = async (vehicleData: VehicleFormData): Promise<Vehicle> => {
    setError(null)
    const formData = new FormData()

    Object.entries(vehicleData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    try {
      const response = await authFetch(`${API_BASE_URL}/vehicles/`, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao criar veículo")
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateVehicle = async (id: number, vehicleData: Partial<VehicleFormData>): Promise<Vehicle> => {
    setError(null)
    const formData = new FormData()

    Object.entries(vehicleData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    try {
      const response = await authFetch(`${API_BASE_URL}/vehicles/${id}/`, {
        method: "PATCH",
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao atualizar veículo")
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteVehicle = async (id: number): Promise<void> => {
    setError(null)
    try {
      const response = await authFetch(`${API_BASE_URL}/vehicles/${id}/`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao excluir veículo")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getVehicle = async (id: number): Promise<Vehicle> => {
    setError(null)
    try {
      const response = await authFetch(`${API_BASE_URL}/vehicles/${id}/`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Erro ao carregar veículo")
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const fetchStats = useCallback(async () => {
    setError(null)
    try {
      const response = await authFetch(`${API_BASE_URL}/vehicles/stats/`)
      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas")
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      console.error("Error fetching stats:", err)
    }
  }, [])

  return {
    vehicles,
    totalCount,
    stats,
    isLoading,
    error,
    fetchVehicles,
    fetchStats,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
  }
}
