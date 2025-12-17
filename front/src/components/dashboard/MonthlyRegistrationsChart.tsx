"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { MonthlyRegistration } from "@/services/dashboard"

interface MonthlyRegistrationsChartProps {
  data: MonthlyRegistration[]
}

export function MonthlyRegistrationsChart({ data }: MonthlyRegistrationsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros Mensais (Últimos 6 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="veiculos"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Veículos"
            />
            <Line
              type="monotone"
              dataKey="condutores"
              stroke="#10b981"
              strokeWidth={2}
              name="Condutores"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
