"use client"

import { useState } from "react"
import { Maximize2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export function ChartCard({ title, children }: ChartCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(false)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 w-full min-h-0">
          {children}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setExpanded(true)}
          aria-label="Expandir gráfico"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
