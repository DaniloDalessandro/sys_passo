"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Conductor } from "./ConductorList"

interface ConductorStatsProps {
  conductors: Conductor[]
}

export function ConductorStats({ conductors }: ConductorStatsProps) {
  const stats = useMemo(() => {
    const total = conductors.length
    const active = conductors.filter(c => c.is_active).length
    const inactive = total - active
    const expired = conductors.filter(c => c.is_license_expired).length

    // CNHs que vencem em até 30 dias
    const expiringSoon = conductors.filter(c => {
      if (c.is_license_expired) return false
      const date = new Date(c.license_expiry_date)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays > 0
    }).length


    return {
      total,
      active,
      inactive,
      expired,
      expiringSoon
    }
  }, [conductors])

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Condutores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total de Condutores</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0">
                {stats.active} ativos
              </Badge>
              {stats.inactive > 0 && (
                <Badge variant="outline" className="text-gray-600 text-xs px-1 py-0">
                  {stats.inactive} inativos
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CNHs Ativas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">CNHs Válidas</CardTitle>
            <CheckCircle className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-green-600">
              {stats.total - stats.expired}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round(((stats.total - stats.expired) / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        {/* CNHs Vencendo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Vencem em 30 dias</CardTitle>
            <Clock className="h-3 w-3 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-orange-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        {/* CNHs Vencidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">CNHs Vencidas</CardTitle>
            <AlertTriangle className="h-3 w-3 text-red-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}