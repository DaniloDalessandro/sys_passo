"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import {
  Eye,
  Loader2,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react"

import {
  getComplaints,
  updateComplaintStatus,
  type Complaint,
  type ComplaintFilters,
} from "@/services/complaints"

import { ComplaintStatusBadge } from "./ComplaintStatusBadge"
import { ComplaintPriorityBadge } from "./ComplaintPriorityBadge"
import {
  formatPlate,
  getRelativeTime,
} from "@/lib/formatters"

export default function DenunciasPage() {
  const router = useRouter()

  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [priorityFilter, setPriorityFilter] = useState<string>('todas')
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    id: number | null;
    protocol: string;
    currentStatus: string;
  }>({
    open: false,
    id: null,
    protocol: '',
    currentStatus: '',
  })

  const [newStatus, setNewStatus] = useState('')

  const loadComplaints = useCallback(async () => {
    setIsLoading(true)
    try {
      const filters: ComplaintFilters = {}
      if (statusFilter !== 'todas') filters.status = statusFilter
      if (priorityFilter !== 'todas') filters.priority = priorityFilter

      const data = await getComplaints(filters)

      const sortedData = [...data]
      if (sortField) {
        sortedData.sort((a, b) => {
          const aVal = (a as Record<string, string>)[sortField] || ''
          const bVal = (b as Record<string, string>)[sortField] || ''

          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      setComplaints(sortedData)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao carregar denúncias')
      setComplaints([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, priorityFilter, sortField, sortOrder])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }

    loadComplaints()
  }, [router, loadComplaints])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1" />
    return sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />
  }

  const handleViewDetails = (id: number) => {
    window.open(`/denuncias/${id}/details`, '_blank')
  }

  const handleStatusChange = async () => {
    if (!statusDialog.id || !newStatus) return

    if (newStatus === statusDialog.currentStatus) {
      toast.info('O status não foi alterado')
      return
    }

    setIsActionLoading(true)
    try {
      await updateComplaintStatus(statusDialog.id, newStatus)
      toast.success('Status atualizado com sucesso!')
      setStatusDialog({ open: false, id: null, protocol: '', currentStatus: '' })
      setNewStatus('')
      await loadComplaints()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar status')
    } finally {
      setIsActionLoading(false)
    }
  }

  const openStatusDialog = (complaint: Complaint) => {
    setStatusDialog({
      open: true,
      id: complaint.id,
      protocol: complaint.protocol,
      currentStatus: complaint.status,
    })
    setNewStatus(complaint.status)
  }

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!Array.isArray(complaints) || complaints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma denúncia encontrada</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter !== 'todas' || priorityFilter !== 'todas'
              ? 'Tente ajustar os filtros'
              : 'Não há denúncias no momento'}
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
                onClick={() => handleSort('protocol')}
              >
                <div className="flex items-center">
                  Protocolo
                  {getSortIcon('protocol')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('vehicle_plate')}
              >
                <div className="flex items-center">
                  Placa
                  {getSortIcon('vehicle_plate')}
                </div>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  Prioridade
                  {getSortIcon('priority')}
                </div>
              </TableHead>
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
            {complaints.map((complaint) => (
              <TableRow
                key={complaint.id}
                className={complaint.status === 'proposto' ? "bg-blue-50 hover:bg-blue-100/80" : ""}
              >
                <TableCell className="font-medium pl-6">
                  <div className="flex items-center gap-2">
                    {complaint.status === 'proposto' && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" title="Nova denúncia" />
                    )}
                    <span className="font-mono">{complaint.protocol}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {formatPlate(complaint.vehicle_plate)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{complaint.complaint_type_display}</span>
                </TableCell>
                <TableCell>
                  <ComplaintPriorityBadge priority={complaint.priority} />
                </TableCell>
                <TableCell>
                  <ComplaintStatusBadge status={complaint.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getRelativeTime(complaint.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewDetails(complaint.id)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {complaint.status !== 'concluido' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openStatusDialog(complaint)}
                        title="Alterar status"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                    {complaint.status === 'em_analise' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={async () => {
                          setIsActionLoading(true)
                          try {
                            await updateComplaintStatus(complaint.id, 'concluido')
                            toast.success('Denúncia concluída com sucesso!')
                            await loadComplaints()
                          } catch (error) {
                            toast.error((error as Error).message || 'Erro ao concluir denúncia')
                          } finally {
                            setIsActionLoading(false)
                          }
                        }}
                        title="Concluir"
                        disabled={isActionLoading}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
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

  return (
    <div className="flex flex-col gap-4 p-4 pt-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Denúncias</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie denúncias de veículos cadastrados no sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <SelectValue placeholder="Prioridade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="proposto">Propostas</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="concluido">Concluídas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadComplaints()}
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Denúncias
          </CardTitle>
          <CardDescription>
            Lista de todas as denúncias registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTable()}
        </CardContent>
      </Card>

      <Dialog open={statusDialog.open} onOpenChange={(open) => {
        setStatusDialog({ ...statusDialog, open })
        if (!open) setNewStatus('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status da Denúncia</DialogTitle>
            <DialogDescription>
              Altere o status da denúncia <strong>{statusDialog.protocol}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposto">Proposto</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialog({ open: false, id: null, protocol: '', currentStatus: '' })
                setNewStatus('')
              }}
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isActionLoading || newStatus === statusDialog.currentStatus}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
