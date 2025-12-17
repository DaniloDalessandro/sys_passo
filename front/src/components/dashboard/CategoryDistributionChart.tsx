"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { CategoryDistribution } from "@/services/dashboard"

interface CategoryDistributionChartProps {
  data: CategoryDistribution[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria de Veículo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
                      <p className="font-semibold">{payload[0].payload.category}</p>
                      <p className="text-sm">Quantidade: {payload[0].value}</p>
                      <p className="text-sm">Porcentagem: {payload[0].payload.percentage}%</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar dataKey="quantidade" name="Quantidade">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
