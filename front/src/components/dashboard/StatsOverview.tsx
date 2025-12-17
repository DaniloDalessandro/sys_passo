"use client"

import { Car, Users, FileText, MessageSquare } from "lucide-react"
import { StatsCard } from "./StatsCard"
import { DashboardStats } from "@/services/dashboard"

interface StatsOverviewProps {
  stats: DashboardStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total de Veículos"
        value={stats.vehicles.total}
        icon={Car}
        iconColor="text-blue-500"
        subtitle={`${stats.vehicles.active} ativos, ${stats.vehicles.inactive} inativos`}
        trend={{
          value: stats.vehicles.growth_percentage,
          isPositive: stats.vehicles.growth_percentage > 0
        }}
      />
      <StatsCard
        title="Total de Condutores"
        value={stats.conductors.total}
        icon={Users}
        iconColor="text-green-500"
        subtitle={`${stats.conductors.active} ativos, ${stats.conductors.inactive} inativos`}
        trend={{
          value: stats.conductors.growth_percentage,
          isPositive: stats.conductors.growth_percentage > 0
        }}
      />
      <StatsCard
        title="Solicitações"
        value={stats.requests.total}
        icon={FileText}
        iconColor="text-orange-500"
        subtitle={`${stats.requests.pending} pendentes, ${stats.requests.approved} aprovadas`}
      />
      <StatsCard
        title="Reclamações"
        value={stats.complaints.total}
        icon={MessageSquare}
        iconColor="text-red-500"
        subtitle={`${stats.complaints.pending} pendentes, ${stats.complaints.resolved} resolvidas`}
      />
    </div>
  )
}
