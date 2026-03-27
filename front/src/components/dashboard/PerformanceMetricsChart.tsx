"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { PerformanceMetric } from "@/services/dashboard"
import { ChartCard } from "./ChartCard"

interface PerformanceMetricsChartProps {
  data: PerformanceMetric[]
}

export function PerformanceMetricsChart({ data }: PerformanceMetricsChartProps) {
  return (
    <ChartCard title="Métricas de Performance">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
