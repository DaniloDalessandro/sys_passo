"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import {
  Users,
  FileText,
  DollarSign,
  Heart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

// Mock data for charts
const contractStatusData = [
  { name: 'Ativos', value: 45, color: '#10b981' },
  { name: 'Expirados', value: 12, color: '#ef4444' },
  { name: 'Em Análise', value: 8, color: '#f59e0b' },
  { name: 'Suspensos', value: 3, color: '#6b7280' },
]

const monthlyContractValues = [
  { month: 'Jan', value: 2450000, contracts: 12 },
  { month: 'Fev', value: 2800000, contracts: 15 },
  { month: 'Mar', value: 3200000, contracts: 18 },
  { month: 'Abr', value: 2900000, contracts: 14 },
  { month: 'Mai', value: 3500000, contracts: 21 },
  { month: 'Jun', value: 4200000, contracts: 25 },
]

const budgetUtilizationData = [
  { category: 'Obras', utilizado: 2800000, total: 4000000 },
  { category: 'Serviços', utilizado: 1500000, total: 2200000 },
  { category: 'Equipamentos', utilizado: 800000, total: 1200000 },
  { category: 'Consultoria', utilizado: 600000, total: 1000000 },
  { category: 'Manutenção', utilizado: 400000, total: 800000 },
]

const contractTimelineData = [
  { month: 'Jan', novos: 5, renovados: 3, finalizados: 2 },
  { month: 'Fev', novos: 8, renovados: 4, finalizados: 1 },
  { month: 'Mar', novos: 12, renovados: 2, finalizados: 3 },
  { month: 'Abr', novos: 6, renovados: 5, finalizados: 4 },
  { month: 'Mai', novos: 10, renovados: 3, finalizados: 2 },
  { month: 'Jun', novos: 15, renovados: 6, finalizados: 5 },
]

// Format currency in Brazilian Real
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage
const formatPercentage = (value: number, total: number) => {
  return `${Math.round((value / total) * 100)}%`
}

// Interfaces for chart fullscreen state
interface ChartStates {
  contractStatus: { fullscreen: boolean }
  monthlyValues: { fullscreen: boolean }
  budgetUtilization: { fullscreen: boolean }
  contractTimeline: { fullscreen: boolean }
}

// Chart Card Wrapper Component
interface ChartCardProps {
  title: string
  children: React.ReactNode
  chartKey: keyof ChartStates
  chartStates: ChartStates
  onToggleFullscreen: (chartKey: keyof ChartStates) => void
}

function ChartCard({ 
  title, 
  children, 
  chartKey, 
  chartStates, 
  onToggleFullscreen
}: ChartCardProps) {
  const isFullscreen = chartStates[chartKey].fullscreen
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Dialog open={isFullscreen} onOpenChange={() => onToggleFullscreen(chartKey)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                  title="Tela cheia"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !m-0 !rounded-none !border-0 !bg-white !top-0 !left-0 !translate-x-0 !translate-y-0 !fixed !inset-0 !z-50" hideClose>
                <div className="h-screen w-screen flex flex-col bg-white">
                  <div className="flex-shrink-0 p-6 pb-4 border-b bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-2xl font-semibold text-gray-900">{title}</DialogTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFullscreen(chartKey)}
                        className="h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                        title="Fechar tela cheia"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-8 bg-gray-50 overflow-hidden">
                    <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                      <ResponsiveContainer width="100%" height="100%">
                        {children}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {children}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [chartStates, setChartStates] = useState<ChartStates>({
    contractStatus: { fullscreen: false },
    monthlyValues: { fullscreen: false },
    budgetUtilization: { fullscreen: false },
    contractTimeline: { fullscreen: false },
  })

  const totalPages = 3


  // Toggle fullscreen state for a chart
  const toggleFullscreen = (chartKey: keyof ChartStates) => {
    setChartStates(prev => ({
      ...prev,
      [chartKey]: {
        ...prev[chartKey],
        fullscreen: !prev[chartKey].fullscreen
      }
    }))
  }

  // Navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="h-full flex flex-col gap-4">
            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total de Contratos</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold">68</h3>
                        <div className="flex items-center ml-2 text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+12%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold">156</h3>
                        <div className="flex items-center ml-2 text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+5%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">ativos no sistema</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Orçamentos</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold">{formatCurrency(18750000)}</h3>
                        <div className="flex items-center ml-2 text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">+8%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">valor total disponível</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Auxílios Ativos</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold">42</h3>
                        <div className="flex items-center ml-2 text-red-500">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">-3%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">em andamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="flex-1 grid gap-4 md:grid-cols-2">
              {/* Contract Status Distribution */}
              <ChartCard
                title="Distribuição de Status dos Contratos"
                chartKey="contractStatus"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <PieChart>
                  <Pie
                    data={contractStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {contractStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartCard>

              {/* Monthly Contract Values */}
              <ChartCard
                title="Valores Mensais de Contratos"
                chartKey="monthlyValues"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <AreaChart data={monthlyContractValues}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? formatCurrency(value as number) : value,
                      name === 'value' ? 'Valor Total' : 'Contratos'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartCard>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="h-full flex flex-col gap-4">
            {/* Secondary Charts */}
            <div className="flex-1 grid gap-4 md:grid-cols-2">
              {/* Budget Utilization */}
              <ChartCard
                title="Utilização de Orçamento por Categoria"
                chartKey="budgetUtilization"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <BarChart data={budgetUtilizationData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="category" type="category" width={80} />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(value as number),
                      name === 'utilizado' ? 'Utilizado' : 'Total Disponível'
                    ]}
                  />
                  <Bar dataKey="total" fill="#e5e7eb" name="total" />
                  <Bar dataKey="utilizado" fill="#10b981" name="utilizado" />
                </BarChart>
              </ChartCard>

              {/* Contract Timeline Activity */}
              <ChartCard
                title="Atividade de Contratos por Mês"
                chartKey="contractTimeline"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <LineChart data={contractTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="novos" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Novos Contratos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="renovados" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Renovados"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="finalizados" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Finalizados"
                  />
                </LineChart>
              </ChartCard>
            </div>

            {/* Expiring Contracts Summary */}
            <div className="flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Contratos Próximos ao Vencimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contrato #2024-001</p>
                        <p className="text-xs text-muted-foreground">Vence em 15 dias</p>
                      </div>
                      <span className="text-amber-600 font-semibold">R$ 85.000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contrato #2024-003</p>
                        <p className="text-xs text-muted-foreground">Vence em 22 dias</p>
                      </div>
                      <span className="text-amber-600 font-semibold">R$ 120.000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contrato #2024-007</p>
                        <p className="text-xs text-muted-foreground">Vence em 28 dias</p>
                      </div>
                      <span className="text-amber-600 font-semibold">R$ 95.500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="h-full flex flex-col gap-6 justify-center">
            {/* Recently Approved Contracts + Performance Summary */}
            <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Contratos Recém Aprovados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contrato #2024-015</p>
                        <p className="text-xs text-muted-foreground">Aprovado hoje</p>
                      </div>
                      <span className="text-green-600 font-semibold">R$ 275.000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contrato #2024-016</p>
                        <p className="text-xs text-muted-foreground">Aprovado ontem</p>
                      </div>
                      <span className="text-green-600 font-semibold">R$ 150.000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Contrato #2024-017</p>
                        <p className="text-xs text-muted-foreground">Aprovado há 2 dias</p>
                      </div>
                      <span className="text-green-600 font-semibold">R$ 89.000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Contratos no Prazo</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Utilização do Orçamento</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Satisfação Interna</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("dashboard/")
    }
    
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        
        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] p-4 pt-0">
      {/* Page Content */}
      <div className="flex-1 overflow-hidden transition-all duration-300 ease-in-out">
        {renderPageContent()}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {/* Page Indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>

          <div className="text-sm text-muted-foreground font-medium">
            {currentPage}/{totalPages}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
