import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { buildApiUrl } from '@/lib/api-client'

export interface Complaint {
  id: number
  protocol: string
  vehicle_plate: string
  complaint_type: string
  complaint_type_display: string
  description: string
  occurrence_date?: string
  occurrence_location?: string
  complainant_name?: string
  complainant_email?: string
  complainant_phone?: string
  is_anonymous: boolean
  status: 'proposto' | 'em_analise' | 'concluido'
  status_display: string
  created_at: string
  updated_at: string
  reviewed_by?: {
    id: number
    username: string
    email: string
  }
  reviewed_at?: string
  admin_notes?: string
  resolution_notes?: string
  vehicle?: {
    id: number
    plate: string
    brand: string
    model: string
    year: string
    color: string
  }
  photos?: Array<{
    id: number
    photo: string
    uploaded_at: string
    order: number
  }>
}

interface FetchComplaintsParams {
  page?: number
  pageSize?: number
  filters?: Record<string, any>
}

async function fetchWithAuth(pathOrUrl: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token')
  const url = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
    ? pathOrUrl
    : buildApiUrl(pathOrUrl)

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  if (response.status === 401) {
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  return response
}

export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchComplaints = useCallback(async (params?: FetchComplaintsParams) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) {
        queryParams.append('page', params.page.toString())
      }

      if (params?.pageSize) {
        queryParams.append('page_size', params.pageSize.toString())
      }

      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
      }

      const url = `api/complaints/${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await fetchWithAuth(url)

      if (!response.ok) {
        throw new Error('Erro ao buscar denúncias')
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setComplaints(data)
        setTotalCount(data.length)
      } else if (data.results) {
        setComplaints(data.results)
        setTotalCount(data.count || data.results.length)
      } else {
        setComplaints([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error)
      toast.error('Erro ao carregar denúncias')
      setComplaints([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getComplaint = useCallback(async (id: number): Promise<Complaint> => {
    try {
      const response = await fetchWithAuth(`api/complaints/${id}/`)

      if (!response.ok) {
        throw new Error('Erro ao buscar denúncia')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar denúncia:', error)
      throw error
    }
  }, [])

  const updateComplaintStatus = useCallback(async (id: number, status: string) => {
    try {
      const response = await fetchWithAuth(`api/complaints/${id}/change_status/`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erro ao atualizar status')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }, [])


  const updateComplaint = useCallback(async (id: number, data: Partial<Complaint>) => {
    try {
      const response = await fetchWithAuth(`api/complaints/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erro ao atualizar denúncia')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar denúncia:', error)
      throw error
    }
  }, [])

  const deleteComplaint = useCallback(async (id: number) => {
    try {
      const response = await fetchWithAuth(`api/complaints/${id}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir denúncia')
      }
    } catch (error) {
      console.error('Erro ao excluir denúncia:', error)
      throw error
    }
  }, [])

  const checkComplaintByProtocol = useCallback(async (protocol: string) => {
    try {
      const response = await fetchWithAuth(`api/complaints/check-by-protocol/?protocol=${encodeURIComponent(protocol)}`)

      if (!response.ok) {
        const error = await response.json()
        // Usar a mensagem detalhada do backend se disponível
        const errorMessage = error.message || error.error || 'Erro ao consultar protocolo'
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao consultar protocolo:', error)
      throw error
    }
  }, [])

  return {
    complaints,
    totalCount,
    isLoading,
    fetchComplaints,
    getComplaint,
    updateComplaintStatus,
    updateComplaint,
    deleteComplaint,
    checkComplaintByProtocol,
  }
}
