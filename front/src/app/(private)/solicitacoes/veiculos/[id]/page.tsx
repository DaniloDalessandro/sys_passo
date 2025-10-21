"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Car,
  Calendar,
  FileText,
  Gauge,
  Fuel,
  Palette,
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

import {
  getVehicleRequestById,
  approveVehicleRequest,
  rejectVehicleRequest,
  type VehicleRequest,
} from "@/services/requests"

import { RequestStatusBadge } from "../../RequestStatusBadge"
import {
  formatPlate,
  formatDateTime,
} from "@/lib/formatters"

export default function VehicleRequestDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [request, setRequest] = useState<VehicleRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const [approveDialog, setApproveDialog] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }

    loadRequest()
  }, [id, router])

  const loadRequest = async () => {
    try {
      setIsLoading(true)
      const data = await getVehicleRequestById(Number(id))
      setRequest(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar solicitação')
      router.push('/solicitacoes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!request) return

    setIsActionLoading(true)
    try {
      await approveVehicleRequest(request.id)
      toast.success('Solicitação aprovada com sucesso!')
      setApproveDialog(false)
      await loadRequest()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar solicitação')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!request || !rejectionReason || rejectionReason.length < 10) {
      toast.error('O motivo da reprovação deve ter pelo menos 10 caracteres')
      return
    }

    setIsActionLoading(true)
    try {
      await rejectVehicleRequest(request.id, rejectionReason)
      toast.success('Solicitação reprovada')
      setRejectDialog(false)
      setRejectionReason('')
      await loadRequest()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reprovar solicitação')
    } finally {
      setIsActionLoading(false)
    }
  }

  const getFuelTypeDisplay = (fuelType: string) => {
    const fuelTypes: Record<string, string> = {
      'gasoline': 'Gasolina',
      'ethanol': 'Etanol',
      'flex': 'Flex',
      'diesel': 'Diesel',
      'electric': 'Elétrico',
      'hybrid': 'Híbrido',
    }
    return fuelTypes[fuelType] || fuelType
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Car className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Solicitação não encontrada</h3>
        <Button onClick={() => router.push('/solicitacoes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Solicitações
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/solicitacoes')}
                className="hover:bg-gray-100 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Detalhes da Solicitação</h1>
                <p className="text-xs text-gray-600">
                  Solicitação #{request.id} - {request.brand} {request.model}
                </p>
              </div>
            </div>
            <RequestStatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-3">
            {/* Dados do Veículo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4" />
                  Dados do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 pt-0">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Placa</Label>
                  <p className="text-sm mt-1 font-medium font-mono">{formatPlate(request.plate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ano</Label>
                  <p className="text-sm mt-1">{request.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Marca</Label>
                  <p className="text-sm mt-1 font-medium">{request.brand}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Modelo</Label>
                  <p className="text-sm mt-1 font-medium">{request.model}</p>
                </div>
              </CardContent>
            </Card>

            {/* Documentação */}
            {(request.chassis_number || request.renavam) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Documentação
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 pt-0">
                  {request.chassis_number && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Chassi</Label>
                      <p className="text-sm mt-1 font-mono">{request.chassis_number}</p>
                    </div>
                  )}
                  {request.renavam && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">RENAVAM</Label>
                      <p className="text-sm mt-1">{request.renavam}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Características */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="h-4 w-4" />
                  Características
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 pt-0">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Cor
                  </Label>
                  <p className="text-sm mt-1">{request.color}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    Combustível
                  </Label>
                  <p className="text-sm mt-1">{getFuelTypeDisplay(request.fuel_type)}</p>
                </div>
                {request.category && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p className="text-sm mt-1">{request.category}</p>
                  </div>
                )}
                {request.passenger_capacity && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Capacidade</Label>
                    <p className="text-sm mt-1">{request.passenger_capacity} passageiros</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fotos */}
            {(request.photo_1 || request.photo_2 || request.photo_3 || request.photo_4 || request.photo_5) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Fotos do Veículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[request.photo_1, request.photo_2, request.photo_3, request.photo_4, request.photo_5]
                      .filter(photo => photo)
                      .map((photo, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={`http://127.0.0.1:8000/${photo}`}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                            onClick={() => window.open(`http://127.0.0.1:8000/${photo}`, '_blank')}
                          />
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mensagem */}
            {request.message && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm p-3 bg-muted rounded-md">{request.message}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Ações */}
            {request.status === 'em_analise' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ações</CardTitle>
                  <CardDescription className="text-xs">
                    Analise a solicitação e tome uma decisão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm"
                    onClick={() => setApproveDialog(true)}
                  >
                    <CheckCircle className="mr-2 h-3.5 w-3.5" />
                    Aprovar Solicitação
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full h-9 text-sm"
                    onClick={() => setRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-3.5 w-3.5" />
                    Recusar Solicitação
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Informações da Solicitação */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data da Solicitação</Label>
                  <p className="text-sm mt-1">{formatDateTime(request.created_at)}</p>
                </div>
                {request.reviewed_at && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data da Análise</Label>
                    <p className="text-sm mt-1">{formatDateTime(request.reviewed_at)}</p>
                  </div>
                )}
                {request.reviewed_by && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Analisado por</Label>
                    <p className="text-sm mt-1">{request.reviewed_by.username}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reprovação */}
            {request.rejection_reason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-700 text-base">Motivo da Reprovação</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-red-900">{request.rejection_reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Veículo Criado */}
            {request.vehicle && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 text-base">Veículo Criado</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-green-900">
                    ID: {request.vehicle.id} - {formatPlate(request.vehicle.plate)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialog} onOpenChange={setApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar a solicitação do veículo <strong>{request.brand} {request.model} - {formatPlate(request.plate)}</strong>?
              <br /><br />
              Esta ação irá criar automaticamente o cadastro do veículo no sistema.
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
      <Dialog open={rejectDialog} onOpenChange={(open) => {
        setRejectDialog(open)
        if (!open) setRejectionReason('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da reprovação para <strong>{request.brand} {request.model}</strong>
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog(false)
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
