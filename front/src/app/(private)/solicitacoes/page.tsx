"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useWebSocket } from "@/hooks/useWebSocket"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Car,
  User,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react"

import {
  getDriverRequests,
  getVehicleRequests,
  approveDriverRequest,
  rejectDriverRequest,
  approveVehicleRequest,
  rejectVehicleRequest,
  markDriverRequestAsViewed,
  markVehicleRequestAsViewed,
  type DriverRequest,
  type VehicleRequest,
} from "@/services/requests"

import { RequestStatusBadge } from "./RequestStatusBadge"
import {
  formatCPF,
  formatPhone,
  formatPlate,
  formatDateTime,
  getRelativeTime,
  formatCNHCategory,
} from "@/lib/formatters"

type RequestType = 'driver' | 'vehicle';

export default function SolicitacoesPage() {
  const router = useRouter()

  // State
  const [activeTab, setActiveTab] = useState<RequestType>('driver')
  const [driverRequests, setDriverRequests] = useState<DriverRequest[]>([])
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [sortField, setSortField] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Modals
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    type: RequestType | null;
    data: DriverRequest | VehicleRequest | null;
  }>({
    open: false,
    type: null,
    data: null,
  })

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    type: RequestType | null;
    id: number | null;
    name: string;
  }>({
    open: false,
    type: null,
    id: null,
    name: '',
  })

  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    type: RequestType | null;
    id: number | null;
    name: string;
  }>({
    open: false,
    type: null,
    id: null,
    name: '',
  })

  const [rejectionReason, setRejectionReason] = useState('')

  // WebSocket para notificações em tempo real
  const { isConnected } = useWebSocket('ws://127.0.0.1:8000/ws/requests/', {
    onMessage: (message) => {
      // Quando recebe notificação de nova solicitação
      if (message.type === 'new_request') {
        console.log('Nova solicitação recebida via WebSocket:', message);

        // Cria URL absoluta para a página de detalhes
        const relativePath = message.request_type === 'driver'
          ? `/solicitacoes/motoristas/${message.request_id}`
          : `/solicitacoes/veiculos/${message.request_id}`;

        // Cria URL absoluta usando window.location.origin
        const detailsUrl = `${window.location.origin}${relativePath}`;

        // Mostra notificação clicável com protocolo
        const title = message.title || message.message || 'Nova solicitação recebida!';
        const protocol = message.protocol || `#${message.request_id}`;

        toast.info(title, {
          description: `${protocol} - Clique para ver detalhes`,
          action: {
            label: 'Ver',
            onClick: () => {
              console.log('Abrindo URL:', detailsUrl);
              window.open(detailsUrl, '_blank');
            },
          },
          duration: 10000, // 10 segundos
        });

        // Recarrega automaticamente a lista SOMENTE se estiver na aba correta
        const isCorrectTab = (message.request_type === 'driver' && activeTab === 'driver') ||
                            (message.request_type === 'vehicle' && activeTab === 'vehicle');

        if (isCorrectTab) {
          // Usa timeout para evitar múltiplas chamadas simultâneas
          setTimeout(() => {
            if (activeTab === 'driver') {
              loadDriverRequests();
            } else {
              loadVehicleRequests();
            }
          }, 500);
        }
      } else if (message.type === 'connection_established') {
        console.log('Conexão WebSocket confirmada');
      }
    },
    onConnect: () => {
      console.log('Conectado ao servidor WebSocket');
    },
    onDisconnect: () => {
      console.log('Desconectado do servidor WebSocket');
    },
    onError: (error) => {
      console.error('Erro no WebSocket:', error);
    },
  })

  // Load data
  const loadDriverRequests = useCallback(async () => {
    try {
      const filters: any = {}
      if (statusFilter !== 'todas') filters.status = statusFilter
      if (sortField) filters.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField

      const data = await getDriverRequests(filters)
      // Garantir que sempre seja um array, mesmo se o service retornar algo inesperado
      setDriverRequests(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar solicitações de motoristas')
      setDriverRequests([]) // Define array vazio em caso de erro
    }
  }, [statusFilter, sortField, sortOrder])

  const loadVehicleRequests = useCallback(async () => {
    try {
      const filters: any = {}
      if (statusFilter !== 'todas') filters.status = statusFilter
      if (sortField) filters.ordering = sortOrder === 'desc' ? `-${sortField}` : sortField

      const data = await getVehicleRequests(filters)
      // Garantir que sempre seja um array, mesmo se o service retornar algo inesperado
      setVehicleRequests(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar solicitações de veículos')
      setVehicleRequests([]) // Define array vazio em caso de erro
    }
  }, [statusFilter, sortField, sortOrder])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'driver') {
        await loadDriverRequests()
      } else {
        await loadVehicleRequests()
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, loadDriverRequests, loadVehicleRequests])

  // Initial load and reload on filter/tab change
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }

    loadData()
  }, [router, loadData])

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default desc
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1" />
    return sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />
  }

  // Handle view request - marks as viewed and opens in new tab
  const handleViewRequest = async (type: RequestType, id: number) => {
    try {
      // Mark as viewed
      if (type === 'driver') {
        await markDriverRequestAsViewed(id)
      } else {
        await markVehicleRequestAsViewed(id)
      }

      // Open in new tab
      const url = type === 'driver' ? `/solicitacoes/motoristas/${id}` : `/solicitacoes/veiculos/${id}`
      window.open(url, '_blank')

      // Reload data to update the viewed status
      await loadData()
    } catch (error) {
      // Silent fail - just open the page anyway
      console.error('Error marking as viewed:', error)
      const url = type === 'driver' ? `/solicitacoes/motoristas/${id}` : `/solicitacoes/veiculos/${id}`
      window.open(url, '_blank')
    }
  }

  // Handle approve
  const handleApprove = async () => {
    if (!approveDialog.id || !approveDialog.type) return

    setIsActionLoading(true)
    try {
      if (approveDialog.type === 'driver') {
        await approveDriverRequest(approveDialog.id)
        toast.success('Solicitação de motorista aprovada com sucesso!')
      } else {
        await approveVehicleRequest(approveDialog.id)
        toast.success('Solicitação de veículo aprovada com sucesso!')
      }

      setApproveDialog({ open: false, type: null, id: null, name: '' })
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar solicitação')
    } finally {
      setIsActionLoading(false)
    }
  }

  // Handle reject
  const handleReject = async () => {
    if (!rejectDialog.id || !rejectDialog.type) return

    if (!rejectionReason || rejectionReason.length < 10) {
      toast.error('O motivo da reprovação deve ter pelo menos 10 caracteres')
      return
    }

    setIsActionLoading(true)
    try {
      if (rejectDialog.type === 'driver') {
        await rejectDriverRequest(rejectDialog.id, rejectionReason)
        toast.success('Solicitação de motorista reprovada')
      } else {
        await rejectVehicleRequest(rejectDialog.id, rejectionReason)
        toast.success('Solicitação de veículo reprovada')
      }

      setRejectDialog({ open: false, type: null, id: null, name: '' })
      setRejectionReason('')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reprovar solicitação')
    } finally {
      setIsActionLoading(false)
    }
  }

  // Render driver table
  const renderDriverTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!Array.isArray(driverRequests) || driverRequests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter !== 'todas'
              ? 'Tente ajustar os filtros'
              : 'Não há solicitações de motoristas no momento'}
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none pl-6"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Nome
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Data
                  {getSortIcon('created_at')}
                </div>
              </TableHead>
              <TableHead className="text-center w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(driverRequests) && driverRequests.map((request) => (
              <TableRow
                key={request.id}
                className={!request.viewed_at && request.status === 'em_analise' ? "bg-blue-50 hover:bg-blue-100/80" : ""}
              >
                <TableCell className="font-medium pl-6">
                  <div className="flex items-center gap-2">
                    {!request.viewed_at && request.status === 'em_analise' && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" title="Não visualizada" />
                    )}
                    {request.name}
                  </div>
                </TableCell>
                <TableCell>{formatPhone(request.phone)}</TableCell>
                <TableCell>
                  {request.license_number} - {formatCNHCategory(request.license_category)}
                </TableCell>
                <TableCell>
                  <RequestStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getRelativeTime(request.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewRequest('driver', request.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {request.status === 'em_analise' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setApproveDialog({
                            open: true,
                            type: 'driver',
                            id: request.id,
                            name: request.name,
                          })}
                          title="Aprovar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setRejectDialog({
                            open: true,
                            type: 'driver',
                            id: request.id,
                            name: request.name,
                          })}
                          title="Recusar"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Render vehicle table
  const renderVehicleTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!Array.isArray(vehicleRequests) || vehicleRequests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Car className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter !== 'todas'
              ? 'Tente ajustar os filtros'
              : 'Não há solicitações de veículos no momento'}
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none pl-6"
                onClick={() => handleSort('plate')}
              >
                <div className="flex items-center">
                  Placa
                  {getSortIcon('plate')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center">
                  Marca/Modelo
                  {getSortIcon('brand')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('year')}
              >
                <div className="flex items-center">
                  Ano
                  {getSortIcon('year')}
                </div>
              </TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Combustível</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Data
                  {getSortIcon('created_at')}
                </div>
              </TableHead>
              <TableHead className="text-center w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(vehicleRequests) && vehicleRequests.map((request) => (
              <TableRow
                key={request.id}
                className={!request.viewed_at && request.status === 'em_analise' ? "bg-blue-50 hover:bg-blue-100/80" : ""}
              >
                <TableCell className="font-medium pl-6">
                  <div className="flex items-center gap-2">
                    {!request.viewed_at && request.status === 'em_analise' && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" title="Não visualizada" />
                    )}
                    {formatPlate(request.plate)}
                  </div>
                </TableCell>
                <TableCell>{request.brand} {request.model}</TableCell>
                <TableCell>{request.year}</TableCell>
                <TableCell>{request.color}</TableCell>
                <TableCell className="capitalize">{request.fuel_type}</TableCell>
                <TableCell>
                  <RequestStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getRelativeTime(request.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewRequest('vehicle', request.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {request.status === 'em_analise' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setApproveDialog({
                            open: true,
                            type: 'vehicle',
                            id: request.id,
                            name: `${request.brand} ${request.model} - ${formatPlate(request.plate)}`,
                          })}
                          title="Aprovar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setRejectDialog({
                            open: true,
                            type: 'vehicle',
                            id: request.id,
                            name: `${request.brand} ${request.model} - ${formatPlate(request.plate)}`,
                          })}
                          title="Recusar"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Render details modal
  const renderDetailsModal = () => {
    if (!detailsDialog.data || !detailsDialog.type) return null

    if (detailsDialog.type === 'driver') {
      const data = detailsDialog.data as DriverRequest
      return (
        <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Solicitação - Motorista</DialogTitle>
              <DialogDescription>
                Informações completas da solicitação de cadastro
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <RequestStatusBadge status={data.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome Completo</Label>
                  <p className="text-sm mt-1">{data.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CPF</Label>
                  <p className="text-sm mt-1">{formatCPF(data.cpf)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm mt-1">{data.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm mt-1">{formatPhone(data.phone)}</p>
                </div>
              </div>

              {data.address && (
                <div>
                  <Label className="text-sm font-medium">Endereço</Label>
                  <p className="text-sm mt-1">{data.address}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Número da CNH</Label>
                  <p className="text-sm mt-1">{data.license_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm mt-1">{formatCNHCategory(data.license_category)}</p>
                </div>
              </div>

              {data.message && (
                <div>
                  <Label className="text-sm font-medium">Mensagem</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{data.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data da Solicitação</Label>
                  <p className="text-sm mt-1">{formatDateTime(data.created_at)}</p>
                </div>
                {data.reviewed_at && (
                  <div>
                    <Label className="text-sm font-medium">Data da Análise</Label>
                    <p className="text-sm mt-1">{formatDateTime(data.reviewed_at)}</p>
                  </div>
                )}
              </div>

              {data.reviewed_by && (
                <div>
                  <Label className="text-sm font-medium">Analisado por</Label>
                  <p className="text-sm mt-1">{data.reviewed_by.username} ({data.reviewed_by.email})</p>
                </div>
              )}

              {data.rejection_reason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Motivo da Reprovação</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 text-red-900 rounded-md border border-red-200">
                    {data.rejection_reason}
                  </p>
                </div>
              )}

              {data.conductor && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <Label className="text-sm font-medium text-green-800">Motorista Criado</Label>
                  <p className="text-sm mt-1 text-green-900">
                    ID: {data.conductor.id} - {data.conductor.name}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDetailsDialog({ open: false, type: null, data: null })}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    } else {
      const data = detailsDialog.data as VehicleRequest
      return (
        <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Solicitação - Veículo</DialogTitle>
              <DialogDescription>
                Informações completas da solicitação de cadastro
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <RequestStatusBadge status={data.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Placa</Label>
                  <p className="text-sm mt-1 font-mono">{formatPlate(data.plate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ano</Label>
                  <p className="text-sm mt-1">{data.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Marca</Label>
                  <p className="text-sm mt-1">{data.brand}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Modelo</Label>
                  <p className="text-sm mt-1">{data.model}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cor</Label>
                  <p className="text-sm mt-1">{data.color}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo de Combustível</Label>
                  <p className="text-sm mt-1 capitalize">{data.fuel_type}</p>
                </div>
              </div>

              {data.message && (
                <div>
                  <Label className="text-sm font-medium">Mensagem</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{data.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data da Solicitação</Label>
                  <p className="text-sm mt-1">{formatDateTime(data.created_at)}</p>
                </div>
                {data.reviewed_at && (
                  <div>
                    <Label className="text-sm font-medium">Data da Análise</Label>
                    <p className="text-sm mt-1">{formatDateTime(data.reviewed_at)}</p>
                  </div>
                )}
              </div>

              {data.reviewed_by && (
                <div>
                  <Label className="text-sm font-medium">Analisado por</Label>
                  <p className="text-sm mt-1">{data.reviewed_by.username} ({data.reviewed_by.email})</p>
                </div>
              )}

              {data.rejection_reason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Motivo da Reprovação</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 text-red-900 rounded-md border border-red-200">
                    {data.rejection_reason}
                  </p>
                </div>
              )}

              {data.vehicle && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <Label className="text-sm font-medium text-green-800">Veículo Criado</Label>
                  <p className="text-sm mt-1 text-green-900">
                    ID: {data.vehicle.id} - {formatPlate(data.vehicle.plate)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDetailsDialog({ open: false, type: null, data: null })}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Solicitações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie solicitações de cadastro de motoristas e veículos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrar por status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovadas</SelectItem>
                <SelectItem value="reprovado">Reprovadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData()}
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RequestType)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="driver" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Motoristas ({driverRequests.length})
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Veículos ({vehicleRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="driver" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Motoristas</CardTitle>
              <CardDescription>
                Lista de todas as solicitações de cadastro de motoristas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDriverTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Veículos</CardTitle>
              <CardDescription>
                Lista de todas as solicitações de cadastro de veículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVehicleTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      {renderDetailsModal()}

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ ...approveDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar a solicitação de <strong>{approveDialog.name}</strong>?
              <br />
              <br />
              Esta ação irá criar automaticamente o cadastro no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isActionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => {
        setRejectDialog({ ...rejectDialog, open })
        if (!open) setRejectionReason('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da reprovação para <strong>{rejectDialog.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Motivo da Reprovação <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Digite o motivo detalhado da reprovação (mínimo 10 caracteres)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className={rejectionReason && rejectionReason.length < 10 ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {rejectionReason.length}/10 caracteres mínimos
              </p>
            </div>

            {rejectionReason && rejectionReason.length < 10 && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                O motivo deve ter pelo menos 10 caracteres
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, type: null, id: null, name: '' })
                setRejectionReason('')
              }}
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isActionLoading || rejectionReason.length < 10}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reprovando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reprovar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
