"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconColor?: string
  iconBgClass?: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", iconBgClass, subtitle, trend }: StatsCardProps) {
  return (
    <Card className="card-hover border bg-card overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110 ${iconBgClass || "icon-gradient"}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold stat-value animate-count-up tracking-tight">
          {value.toLocaleString('pt-BR')}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend.isPositive ? '+' : ''}{trend.value}% em relação ao mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
