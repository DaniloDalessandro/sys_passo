"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"
import { DashboardAlert } from "@/services/dashboard"
import Link from "next/link"

interface AlertsListProps {
  alerts: DashboardAlert[]
}

const alertIcons = {
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info
}

const alertColors = {
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200"
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Info className="h-5 w-5 mr-2" />
            <p>Nenhum alerta no momento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alertIcons[alert.type]
          const colorClass = alertColors[alert.type]

          return (
            <Link key={index} href={alert.link}>
              <div className={`flex items-start p-3 rounded-lg border ${colorClass} hover:opacity-80 transition-opacity cursor-pointer`}>
                <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{alert.title}</h4>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-white">
                    {alert.count}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
