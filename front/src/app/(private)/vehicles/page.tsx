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
  Truck,
  Car,
  Wrench,
  AlertTriangle,
  Plus,
  Search,
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock data for vehicles
const vehiclesData = [
  { 
    id: 1, 
    placa: "ABC-1234", 
    modelo: "Mercedes-Benz Sprinter", 
    ano: "2020", 
    tipo: "van",
    status: "ativo",
    kmRodados: 45000,
    proximaManutencao: "2024-10-15",
    chassi: "9BW123456789ABC01"
  },
  { 
    id: 2, 
    placa: "DEF-5678", 
    modelo: "Volkswagen Constellation", 
    ano: "2019", 
    tipo: "caminhao",
    status: "manutencao",
    kmRodados: 98000,
    proximaManutencao: "2024-09-20",
    chassi: "9BW123456789ABC02"
  },
  { 
    id: 3, 
    placa: "GHI-9012", 
    modelo: "Iveco Daily", 
    ano: "2021", 
    tipo: "van",
    status: "ativo",
    kmRodados: 32000,
    proximaManutencao: "2024-11-30",
    chassi: "9BW123456789ABC03"
  },
  { 
    id: 4, 
    placa: "JKL-3456", 
    modelo: "Ford Transit", 
    ano: "2018", 
    tipo: "van",
    status: "inativo",
    kmRodados: 125000,
    proximaManutencao: "2024-09-10",
    chassi: "9BW123456789ABC04"
  },
]

export default function VehiclesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [vehicles, setVehicles] = useState(vehiclesData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  // Filter vehicles based on search and status
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || vehicle.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get statistics
  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === "ativo").length,
    maintenance: vehicles.filter(v => v.status === "manutencao").length,
    needingMaintenance: vehicles.filter(v => {
      const today = new Date()
      const maintenanceDate = new Date(v.proximaManutencao)
      const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilMaintenance <= 7 && daysUntilMaintenance > 0
    }).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "text-green-600 bg-green-50"
      case "manutencao":
        return "text-amber-600 bg-amber-50"
      case "inativo":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getVehicleIcon = (tipo: string) => {
    switch (tipo) {
      case "caminhao":
        return <Truck className="h-5 w-5" />
      default:
        return <Car className="h-5 w-5" />
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
    
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 pt-0">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
            <p className="text-gray-500 mt-1">Gerenciar frota de veículos</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Veículo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                  <p className="text-xs text-muted-foreground">veículos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                  <h3 className="text-2xl font-bold">{stats.active}</h3>
                  <p className="text-xs text-muted-foreground">em operação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
                  <h3 className="text-2xl font-bold">{stats.maintenance}</h3>
                  <p className="text-xs text-muted-foreground">em reparo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Urgente</p>
                  <h3 className="text-2xl font-bold">{stats.needingMaintenance}</h3>
                  <p className="text-xs text-muted-foreground">manutenção próxima</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por placa ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="manutencao">Em Manutenção</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>

        {/* Vehicles List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos ({filteredVehicles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-600">Veículo</th>
                    <th className="text-left p-3 font-medium text-gray-600">Placa</th>
                    <th className="text-left p-3 font-medium text-gray-600">Modelo</th>
                    <th className="text-left p-3 font-medium text-gray-600">Ano</th>
                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 font-medium text-gray-600">KM</th>
                    <th className="text-left p-3 font-medium text-gray-600">Próx. Manutenção</th>
                    <th className="text-left p-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(vehicle.tipo)}
                          <span className="font-medium text-gray-600">
                            {vehicle.tipo.charAt(0).toUpperCase() + vehicle.tipo.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold">{vehicle.placa}</td>
                      <td className="p-3 font-medium">{vehicle.modelo}</td>
                      <td className="p-3 text-gray-600">{vehicle.ano}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {vehicle.kmRodados.toLocaleString("pt-BR")} km
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(vehicle.proximaManutencao).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum veículo encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}