"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, AlertTriangle, CheckCircle, Wrench } from "lucide-react"
import { Vehicle } from "@/hooks/useVehicles"

interface VehicleStatsProps {
  vehicles: Vehicle[]
}

export function VehicleStats({ vehicles }: VehicleStatsProps) {
  const stats = useMemo(() => {
    const total = vehicles.length
    const active = vehicles.filter(v => v.status === 'ativo').length
    const maintenance = vehicles.filter(v => v.status === 'manutencao').length
    const inactive = vehicles.filter(v => v.status === 'inativo').length

    // Veículos que precisam de manutenção em até 7 dias
    const needingMaintenance = vehicles.filter(v => {
      if (v.status === 'manutencao') return false
      const date = new Date(v.proximaManutencao)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length

    return {
      total,
      active,
      maintenance,
      inactive,
      needingMaintenance
    }
  }, [vehicles])

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Veículos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total de Veículos</CardTitle>
            <Car className="h-3 w-3 text-muted-foreground" />
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

        {/* Veículos Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Em Operação</CardTitle>
            <CheckCircle className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        {/* Manutenção Próxima */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Manutenção Próxima</CardTitle>
            <AlertTriangle className="h-3 w-3 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-orange-600">{stats.needingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>

        {/* Em Manutenção */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Em Manutenção</CardTitle>
            <Wrench className="h-3 w-3 text-red-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-red-600">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.maintenance / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}