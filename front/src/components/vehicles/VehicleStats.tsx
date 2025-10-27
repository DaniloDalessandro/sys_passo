"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Calendar, Zap } from "lucide-react"
import { VehicleStats as VehicleStatsType } from "@/hooks/useVehicles"

interface VehicleStatsProps {
  stats: VehicleStatsType | null
}

export function VehicleStats({ stats }: VehicleStatsProps) {
  // Se as estatísticas ainda não foram carregadas, mostra valores zerados
  const displayStats = stats || {
    total_vehicles: 0,
    active_vehicles: 0,
    inactive_vehicles: 0,
    old_vehicles: 0,
    electric_vehicles: 0,
    categories_stats: {},
    fuel_type_stats: {}
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total de Veículos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Total de Veículos</CardTitle>
            <Car className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold">{displayStats.total_vehicles}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0">
                {displayStats.active_vehicles} ativos
              </Badge>
              {displayStats.inactive_vehicles > 0 && (
                <Badge variant="outline" className="text-gray-600 text-xs px-1 py-0">
                  {displayStats.inactive_vehicles} inativos
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Veículos com mais de 10 anos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Veículos +10 anos</CardTitle>
            <Calendar className="h-3 w-3 text-orange-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-orange-600">
              {displayStats.old_vehicles}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayStats.active_vehicles > 0 ? Math.round((displayStats.old_vehicles / displayStats.active_vehicles) * 100) : 0}% da frota ativa
            </p>
          </CardContent>
        </Card>

        {/* Frota Eletrificada */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Frota Eletrificada</CardTitle>
            <Zap className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xl font-bold text-green-600">{displayStats.electric_vehicles}</div>
            <p className="text-xs text-muted-foreground">
              Elétricos e híbridos
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}