"use client"

import { useEffect, useState, useCallback } from "react"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { MonthlyRegistrationsChart } from "@/components/dashboard/MonthlyRegistrationsChart"
import { RequestsStatusChart } from "@/components/dashboard/RequestsStatusChart"
import { CategoryDistributionChart } from "@/components/dashboard/CategoryDistributionChart"
import {
  getDashboardStats,
  getDashboardCharts,
  DashboardStats,
  DashboardCharts
} from "@/services/dashboard"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [charts, setCharts] = useState<DashboardCharts | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const [statsData, chartsData] = await Promise.all([
        getDashboardStats(),
        getDashboardCharts()
      ])

      setStats(statsData)
      setCharts(chartsData)
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      toast({
        title: "Erro ao carregar dashboard",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats || !charts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema ViaLumiar</p>
      </div>

      {/* Estatísticas Principais */}
      <StatsOverview stats={stats} />

      {/* Gráficos Principais */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyRegistrationsChart data={charts.monthlyRegistrations} />
        <CategoryDistributionChart data={charts.categoryDistribution} />
      </div>

      {/* Gráfico de Status de Solicitações - Largura Total */}
      <div className="w-full">
        <RequestsStatusChart data={charts.requestsStatus} />
      </div>
    </div>
  )
}
