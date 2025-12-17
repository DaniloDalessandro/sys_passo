import { authFetch } from "@/lib/api-client"

export interface DashboardStats {
  vehicles: {
    total: number
    active: number
    inactive: number
    growth_percentage: number
  }
  conductors: {
    total: number
    active: number
    inactive: number
    growth_percentage: number
  }
  requests: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  complaints: {
    total: number
    pending: number
    resolved: number
    investigating: number
  }
}

export interface VehicleStatusData {
  name: string
  value: number
  color: string
}

export interface MonthlyRegistration {
  month: string
  veiculos: number
  condutores: number
}

export interface CategoryDistribution {
  category: string
  quantidade: number
  percentage: number
}

export interface RequestStatus {
  month: string
  aprovadas: number
  pendentes: number
  rejeitadas: number
}

export interface PerformanceMetric {
  subject: string
  A: number
  fullMark: number
}

export interface DashboardCharts {
  vehicleStatus: VehicleStatusData[]
  monthlyRegistrations: MonthlyRegistration[]
  categoryDistribution: CategoryDistribution[]
  requestsStatus: RequestStatus[]
  performanceMetrics: PerformanceMetric[]
}

export interface RecentActivity {
  type: 'request' | 'complaint'
  id: number
  description: string
  status: string
  date: string
}

export interface DashboardAlert {
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  count: number
  link: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await authFetch('/api/dashboard/stats/')

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
  }

  return response.json()
}

export async function getDashboardCharts(): Promise<DashboardCharts> {
  const response = await authFetch('/api/dashboard/charts/')

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
  }

  return response.json()
}

export async function getDashboardRecentActivity(): Promise<RecentActivity[]> {
  const response = await authFetch('/api/dashboard/recent-activity/')

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
  }

  return response.json()
}

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const response = await authFetch('/api/dashboard/alerts/')

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
  }

  return response.json()
}
