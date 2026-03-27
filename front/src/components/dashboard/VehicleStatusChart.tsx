"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { VehicleStatusData } from "@/services/dashboard"
import { ChartCard } from "./ChartCard"

interface VehicleStatusChartProps {
  data: VehicleStatusData[]
}

export function VehicleStatusChart({ data }: VehicleStatusChartProps) {
  return (
    <ChartCard title="Status dos Veículos">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
