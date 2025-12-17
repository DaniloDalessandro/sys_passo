"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { RequestStatus } from "@/services/dashboard"

interface RequestsStatusChartProps {
  data: RequestStatus[]
}

export function RequestsStatusChart({ data }: RequestsStatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status de Solicitações (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="aprovadas" fill="#10b981" name="Aprovadas" />
            <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
            <Bar dataKey="rejeitadas" fill="#ef4444" name="Rejeitadas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
