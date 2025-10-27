"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { ConductorStats as ConductorStatsType } from "@/hooks/useConductors"

interface ConductorStatsProps {
  stats: ConductorStatsType | null
}

export function ConductorStats({ stats }: ConductorStatsProps) {
  // Se as estatísticas ainda não foram carregadas, mostra valores zerados
  const displayStats = stats || {
    total_conductors: 0,
    active_conductors: 0,
    inactive_conductors: 0,
    expiring_soon: 0,
    expired_licenses: 0,
    categories_stats: {}
  }

  const validLicenses = displayStats.total_conductors - displayStats.expired_licenses

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
            <div className="text-xl font-bold">{displayStats.total_conductors}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0">
                {displayStats.active_conductors} ativos
              </Badge>
              {displayStats.inactive_conductors > 0 && (
                <Badge variant="outline" className="text-gray-600 text-xs px-1 py-0">
                  {displayStats.inactive_conductors} inativos
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
              {validLicenses}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayStats.total_conductors > 0 ? Math.round((validLicenses / displayStats.total_conductors) * 100) : 0}% do total
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
            <div className="text-xl font-bold text-orange-600">{displayStats.expiring_soon}</div>
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
            <div className="text-xl font-bold text-red-600">{displayStats.expired_licenses}</div>
            <p className="text-xs text-muted-foreground">
              {displayStats.total_conductors > 0 ? Math.round((displayStats.expired_licenses / displayStats.total_conductors) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}