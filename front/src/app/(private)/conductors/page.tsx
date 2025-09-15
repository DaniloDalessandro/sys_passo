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
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock data for conductors
const conductorsData = [
  { 
    id: 1, 
    nome: "João Silva", 
    cnh: "123456789", 
    categoria: "D", 
    status: "ativo",
    vencimento: "2025-03-15",
    telefone: "(11) 99999-9999",
    endereco: "Rua A, 123"
  },
  { 
    id: 2, 
    nome: "Maria Santos", 
    cnh: "987654321", 
    categoria: "E", 
    status: "ativo",
    vencimento: "2025-07-20",
    telefone: "(11) 88888-8888",
    endereco: "Rua B, 456"
  },
  { 
    id: 3, 
    nome: "Pedro Costa", 
    cnh: "456789123", 
    categoria: "D", 
    status: "suspenso",
    vencimento: "2024-12-10",
    telefone: "(11) 77777-7777",
    endereco: "Rua C, 789"
  },
  { 
    id: 4, 
    nome: "Ana Lima", 
    cnh: "789123456", 
    categoria: "C", 
    status: "ativo",
    vencimento: "2025-09-05",
    telefone: "(11) 66666-6666",
    endereco: "Rua D, 101"
  },
]

export default function ConductorsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [conductors, setConductors] = useState(conductorsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  // Filter conductors based on search and status
  const filteredConductors = conductors.filter(conductor => {
    const matchesSearch = conductor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conductor.cnh.includes(searchTerm)
    const matchesStatus = statusFilter === "todos" || conductor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get statistics
  const stats = {
    total: conductors.length,
    active: conductors.filter(c => c.status === "ativo").length,
    suspended: conductors.filter(c => c.status === "suspenso").length,
    expiring: conductors.filter(c => {
      const today = new Date()
      const expiry = new Date(c.vencimento)
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "text-green-600 bg-green-50"
      case "suspenso":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
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
            <h1 className="text-3xl font-bold text-gray-900">Condutores</h1>
            <p className="text-gray-500 mt-1">Gerenciar condutores do sistema</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Condutor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                  <p className="text-xs text-muted-foreground">condutores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
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
                <UserX className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Suspensos</p>
                  <h3 className="text-2xl font-bold">{stats.suspended}</h3>
                  <p className="text-xs text-muted-foreground">temporariamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Vencendo</p>
                  <h3 className="text-2xl font-bold">{stats.expiring}</h3>
                  <p className="text-xs text-muted-foreground">em 30 dias</p>
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
                placeholder="Buscar por nome ou CNH..."
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
              <option value="suspenso">Suspensos</option>
            </select>
          </div>
        </div>

        {/* Conductors List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Condutores ({filteredConductors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-600">Nome</th>
                    <th className="text-left p-3 font-medium text-gray-600">CNH</th>
                    <th className="text-left p-3 font-medium text-gray-600">Categoria</th>
                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                    <th className="text-left p-3 font-medium text-gray-600">Vencimento</th>
                    <th className="text-left p-3 font-medium text-gray-600">Telefone</th>
                    <th className="text-left p-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConductors.map((conductor) => (
                    <tr key={conductor.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{conductor.nome}</td>
                      <td className="p-3 text-gray-600">{conductor.cnh}</td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {conductor.categoria}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(conductor.status)}`}>
                          {conductor.status.charAt(0).toUpperCase() + conductor.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(conductor.vencimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3 text-gray-600">{conductor.telefone}</td>
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
              
              {filteredConductors.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum condutor encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}