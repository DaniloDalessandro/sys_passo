"use client"

import { useEffect, useState, useCallback } from "react"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { MonthlyRegistrationsChart } from "@/components/dashboard/MonthlyRegistrationsChart"
import { RequestsStatusChart } from "@/components/dashboard/RequestsStatusChart"
import { CategoryDistributionChart } from "@/components/dashboard/CategoryDistributionChart"
import { AlertsList } from "@/components/dashboard/AlertsList"
import { RecentActivityList } from "@/components/dashboard/RecentActivityList"
import {
  getDashboardStats,
  getDashboardCharts,
  getDashboardRecentActivity,
  getDashboardAlerts,
  DashboardStats,
  DashboardCharts,
  RecentActivity,
  DashboardAlert,
} from "@/services/dashboard"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [charts, setCharts] = useState<DashboardCharts | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      const [statsResult, chartsResult, alertsResult, activityResult] = await Promise.allSettled([
        getDashboardStats(),
        getDashboardCharts(),
        getDashboardAlerts(),
        getDashboardRecentActivity(),
      ])

      if (statsResult.status === "fulfilled") setStats(statsResult.value)
      else toast({ title: "Erro ao carregar estatísticas", variant: "destructive" })

      if (chartsResult.status === "fulfilled") setCharts(chartsResult.value)
      else toast({ title: "Erro ao carregar gráficos", variant: "destructive" })

      if (alertsResult.status === "fulfilled") setAlerts(alertsResult.value)
      if (activityResult.status === "fulfilled") setRecentActivity(activityResult.value)
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
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema ViaLumiar</p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up animate-delay-300">
        <MonthlyRegistrationsChart data={charts.monthlyRegistrations} />
        <CategoryDistributionChart data={charts.categoryDistribution} />
      </div>

      <div className="w-full animate-fade-in-up animate-delay-400">
        <RequestsStatusChart data={charts.requestsStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up animate-delay-500">
        <AlertsList alerts={alerts} />
        <RecentActivityList activities={recentActivity} />
      </div>
    </div>
  )
}
