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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"
import {
  Car,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

// Dados modernos para o sistema de veículos e condutores
const vehicleStatusData = [
  { name: 'Ativos', value: 156, color: '#10b981' },
  { name: 'Manutenção', value: 23, color: '#f59e0b' },
  { name: 'Inativos', value: 12, color: '#ef4444' },
  { name: 'Reserva', value: 8, color: '#6366f1' },
]

const monthlyRegistrations = [
  { month: 'Jan', veiculos: 12, condutores: 18 },
  { month: 'Fev', veiculos: 15, condutores: 22 },
  { month: 'Mar', veiculos: 18, condutores: 25 },
  { month: 'Abr', veiculos: 14, condutores: 20 },
  { month: 'Mai', veiculos: 21, condutores: 28 },
  { month: 'Jun', veiculos: 25, condutores: 32 },
]

const categoryDistribution = [
  { category: 'Micro-ônibus', quantidade: 45, percentage: 23 },
  { category: 'Van', quantidade: 67, percentage: 34 },
  { category: 'Ônibus', quantidade: 52, percentage: 26 },
  { category: 'Executivo', quantidade: 35, percentage: 17 },
]

const requestsStatus = [
  { month: 'Jan', aprovadas: 15, pendentes: 8, rejeitadas: 2 },
  { month: 'Fev', aprovadas: 22, pendentes: 5, rejeitadas: 3 },
  { month: 'Mar', aprovadas: 18, pendentes: 12, rejeitadas: 1 },
  { month: 'Abr', aprovadas: 25, pendentes: 7, rejeitadas: 4 },
  { month: 'Mai', aprovadas: 20, pendentes: 10, rejeitadas: 2 },
  { month: 'Jun', aprovadas: 28, pendentes: 6, rejeitadas: 3 },
]

const performanceMetrics = [
  { subject: 'Pontualidade', A: 92, fullMark: 100 },
  { subject: 'Segurança', A: 88, fullMark: 100 },
  { subject: 'Satisfação', A: 95, fullMark: 100 },
  { subject: 'Manutenção', A: 78, fullMark: 100 },
  { subject: 'Disponibilidade', A: 85, fullMark: 100 },
]

// Interfaces para estado do gráfico
interface ChartStates {
  vehicleStatus: { fullscreen: boolean }
  monthlyRegistrations: { fullscreen: boolean }
  categoryDistribution: { fullscreen: boolean }
  requestsStatus: { fullscreen: boolean }
  performanceMetrics: { fullscreen: boolean }
}

// Componente de Card de Gráfico
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
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{title}</CardTitle>
            <Dialog open={isFullscreen} onOpenChange={() => onToggleFullscreen(chartKey)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors hover:bg-blue-50"
                  title="Tela cheia"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-none !w-screen !h-screen !p-0 !m-0 !rounded-none !border-0 !bg-gradient-to-br !from-gray-50 !to-gray-100 !top-0 !left-0 !translate-x-0 !translate-y-0 !fixed !inset-0 !z-50" hideClose>
                <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex-shrink-0 p-6 pb-4 border-b bg-white/80 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</DialogTitle>
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
                  <div className="flex-1 p-8 overflow-hidden">
                    <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
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
        <CardContent className="p-4 pt-0">
          <ResponsiveContainer width="100%" height={180}>
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
    vehicleStatus: { fullscreen: false },
    monthlyRegistrations: { fullscreen: false },
    categoryDistribution: { fullscreen: false },
    requestsStatus: { fullscreen: false },
    performanceMetrics: { fullscreen: false },
  })

  const totalPages = 2

  const toggleFullscreen = (chartKey: keyof ChartStates) => {
    setChartStates(prev => ({
      ...prev,
      [chartKey]: {
        ...prev[chartKey],
        fullscreen: !prev[chartKey].fullscreen
      }
    }))
  }

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

  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Métricas Cards com gradiente */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-100">Total de Veículos</p>
                      <h3 className="text-3xl font-bold mt-1">199</h3>
                      <span className="text-xs text-blue-100 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% este mês
                      </span>
                    </div>
                    <Car className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-100">Condutores Ativos</p>
                      <h3 className="text-3xl font-bold mt-1">145</h3>
                      <span className="text-xs text-purple-100 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +8% este mês
                      </span>
                    </div>
                    <Users className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-100">Solicitações</p>
                      <h3 className="text-3xl font-bold mt-1">67</h3>
                      <span className="text-xs text-green-100 flex items-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        28 aprovadas
                      </span>
                    </div>
                    <FileText className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-100">Denúncias</p>
                      <h3 className="text-3xl font-bold mt-1">23</h3>
                      <span className="text-xs text-amber-100 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        15 pendentes
                      </span>
                    </div>
                    <AlertCircle className="h-12 w-12 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Principais */}
            <div className="flex-1 min-h-0 grid gap-4 md:grid-cols-2">
              {/* Status dos Veículos - Donut Chart Moderno */}
              <ChartCard
                title="Status dos Veículos"
                chartKey="vehicleStatus"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <PieChart>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="url(#greenGrad)" />
                    <Cell fill="url(#amberGrad)" />
                    <Cell fill="url(#redGrad)" />
                    <Cell fill="url(#indigoGrad)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ChartCard>

              {/* Cadastros Mensais - Area Chart com Gradiente */}
              <ChartCard
                title="Cadastros Mensais"
                chartKey="monthlyRegistrations"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <AreaChart data={monthlyRegistrations}>
                  <defs>
                    <linearGradient id="colorVeiculos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCondutores" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="veiculos"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVeiculos)"
                    name="Veículos"
                  />
                  <Area
                    type="monotone"
                    dataKey="condutores"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCondutores)"
                    name="Condutores"
                  />
                </AreaChart>
              </ChartCard>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Gráficos Secundários */}
            <div className="flex-1 min-h-0 grid gap-4 md:grid-cols-2">
              {/* Distribuição por Categoria - Bar Chart Horizontal */}
              <ChartCard
                title="Distribuição por Categoria"
                chartKey="categoryDistribution"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <BarChart data={categoryDistribution} layout="vertical">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="quantidade" fill="url(#barGrad)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartCard>

              {/* Status de Solicitações - Line Chart */}
              <ChartCard
                title="Solicitações por Mês"
                chartKey="requestsStatus"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <LineChart data={requestsStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="aprovadas"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Aprovadas"
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pendentes"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Pendentes"
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rejeitadas"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Rejeitadas"
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartCard>
            </div>

            {/* Métricas de Performance - Radar Chart */}
            <div className="flex-shrink-0">
              <ChartCard
                title="Métricas de Performance"
                chartKey="performanceMetrics"
                chartStates={chartStates}
                onToggleFullscreen={toggleFullscreen}
              >
                <RadarChart data={performanceMetrics}>
                  <defs>
                    <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="url(#radarGrad)"
                    fillOpacity={0.7}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                </RadarChart>
              </ChartCard>
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
      router.push("/")
    }

    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 pt-0 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Conteúdo da Página */}
      <div className="flex-1 min-h-0 overflow-hidden transition-all duration-300 ease-in-out">
        {renderPageContent()}
      </div>

      {/* Navegação */}
      <div className="flex-shrink-0 mt-4">
        <div className="flex items-center justify-between max-w-md mx-auto bg-white rounded-full shadow-lg px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 h-8 px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-blue-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300 ${
                    currentPage === pageNumber
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 h-8 px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-blue-50"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
