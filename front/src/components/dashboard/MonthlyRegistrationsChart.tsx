"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { MonthlyRegistration } from "@/services/dashboard"
import { ChartCard } from "./ChartCard"

interface MonthlyRegistrationsChartProps {
  data: MonthlyRegistration[]
}

export function MonthlyRegistrationsChart({ data }: MonthlyRegistrationsChartProps) {
  return (
    <ChartCard title="Registros Mensais (Últimos 6 Meses)">
      <ResponsiveContainer width="100%" height="100%">
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
    </ChartCard>
  )
}
