"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconColor?: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", subtitle, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-lg p-2 bg-muted/60">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive ? '▲ +' : '▼ '}{trend.value}% em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}
