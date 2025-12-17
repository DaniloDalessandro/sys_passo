"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, MessageSquare, Clock } from "lucide-react"
import { RecentActivity } from "@/services/dashboard"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecentActivityListProps {
  activities: RecentActivity[]
}

const activityIcons = {
  request: FileText,
  complaint: MessageSquare
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  resolved: "bg-blue-100 text-blue-800",
  investigating: "bg-purple-100 text-purple-800",
  aprovado: "bg-green-100 text-green-800",
  em_analise: "bg-purple-100 text-purple-800",
  proposto: "bg-yellow-100 text-yellow-800",
  concluido: "bg-blue-100 text-blue-800"
}

const statusLabels = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
  resolved: "Resolvida",
  investigating: "Em Investigação",
  aprovado: "Aprovada",
  em_analise: "Em Análise",
  proposto: "Proposta",
  concluido: "Concluída"
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Clock className="h-5 w-5 mr-2" />
            <p>Nenhuma atividade recente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const statusColor = statusColors[activity.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
            const statusLabel = statusLabels[activity.status as keyof typeof statusLabels] || activity.status

            return (
              <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3 pb-3 border-b last:border-b-0 last:pb-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.date), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
