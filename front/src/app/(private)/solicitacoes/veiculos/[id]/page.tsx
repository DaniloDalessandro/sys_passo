"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
  Eye,
  AlertCircle,
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
  markVehicleRequestAsViewed,
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

  const getPdfEndpointUrl = (requestId: number, type: 'crlv' | 'insurance') => {
    const endpoint = type === 'crlv' ? 'crlv-pdf' : 'insurance-pdf';
    return `http://127.0.0.1:8000/api/requests/vehicles/${requestId}/${endpoint}/`;
  }

  const openPdfInNewTab = async (requestId: number, type: 'crlv' | 'insurance', title: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        return;
      }

      const url = getPdfEndpointUrl(requestId, type);

      // Fetch PDF with authentication
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar PDF');
      }

      // Get PDF as blob
      const blob = await response.blob();

      // Create object URL and open in new tab
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');

      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast.success('PDF aberto em nova aba');
    } catch (error: any) {
      console.error('Error opening PDF:', error);
      toast.error('Erro ao abrir PDF');
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

      if (!data.viewed_at) {
        try {
          await markVehicleRequestAsViewed(Number(id))
        } catch (error) {
          console.error('Error marking as viewed:', error)
        }
      }
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
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/solicitacoes')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{request.brand} {request.model}</h1>
                <p className="text-sm text-gray-500">Protocolo #{request.id} • {formatPlate(request.plate)}</p>
              </div>
            </div>
            <RequestStatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Dados do Veículo */}
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Car className="h-4 w-4 text-indigo-600" />
                Dados do Veículo
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Placa</Label>
                  <p className="text-sm font-medium mt-1">{formatPlate(request.plate)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Ano</Label>
                  <p className="text-sm mt-1">{request.year}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Marca</Label>
                  <p className="text-sm font-medium mt-1">{request.brand}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Modelo</Label>
                  <p className="text-sm font-medium mt-1">{request.model}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Cor</Label>
                  <p className="text-sm mt-1">{request.color}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Combustível</Label>
                  <p className="text-sm mt-1">{getFuelTypeDisplay(request.fuel_type)}</p>
                </div>
                {request.category && (
                  <div>
                    <Label className="text-xs text-gray-500">Categoria</Label>
                    <p className="text-sm mt-1">{request.category}</p>
                  </div>
                )}
                {request.passenger_capacity && (
                  <div>
                    <Label className="text-xs text-gray-500">Capacidade</Label>
                    <p className="text-sm mt-1">{request.passenger_capacity} passageiros</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentação */}
            {(request.chassis_number || request.renavam) && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Documentação
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {request.chassis_number && (
                    <div>
                      <Label className="text-xs text-gray-500">Chassi</Label>
                      <p className="text-sm mt-1">{request.chassis_number}</p>
                    </div>
                  )}
                  {request.renavam && (
                    <div>
                      <Label className="text-xs text-gray-500">RENAVAM</Label>
                      <p className="text-sm mt-1">{request.renavam}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documentos PDF */}
            {(request.crlv_pdf || request.insurance_pdf) && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-600" />
                  Documentos
                </h2>
                <div className="space-y-2">
                  {request.crlv_pdf && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">CRLV</p>
                          <p className="text-xs text-gray-500">Certificado de Registro e Licenciamento</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openPdfInNewTab(request.id, 'crlv', 'CRLV')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                  {request.insurance_pdf && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Seguro do Veículo</p>
                          <p className="text-xs text-gray-500">Documento do Seguro</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openPdfInNewTab(request.id, 'insurance', 'Seguro do Veículo')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fotos */}
            {(request.photo_1 || request.photo_2 || request.photo_3 || request.photo_4 || request.photo_5) && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4 text-amber-600" />
                  Fotos do Veículo
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[request.photo_1, request.photo_2, request.photo_3, request.photo_4, request.photo_5]
                    .filter(photo => photo)
                    .map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(`http://127.0.0.1:8000/${photo}`, '_blank')}
                      >
                        <img
                          src={`http://127.0.0.1:8000/${photo}`}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Mensagem */}
            {request.message && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-pink-600" />
                  Mensagem
                </h2>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{request.message}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Ações */}
            {request.status === 'em_analise' && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Ações</h3>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setApproveDialog(true)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Recusar
                  </Button>
                </div>
              </div>
            )}

            {/* Informações */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                Informações
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Data da Solicitação</Label>
                  <p className="text-sm mt-1">{formatDateTime(request.created_at)}</p>
                </div>
                {request.reviewed_at && (
                  <div>
                    <Label className="text-xs text-gray-500">Data da Análise</Label>
                    <p className="text-sm mt-1">{formatDateTime(request.reviewed_at)}</p>
                  </div>
                )}
                {request.reviewed_by && (
                  <div>
                    <Label className="text-xs text-gray-500">Analisado por</Label>
                    <p className="text-sm mt-1">{request.reviewed_by.username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reprovação */}
            {request.rejection_reason && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-base font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Reprovação
                </h3>
                <p className="text-sm text-red-800">{request.rejection_reason}</p>
              </div>
            )}

            {/* Veículo Criado */}
            {request.vehicle && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-base font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Criado
                </h3>
                <p className="text-sm text-green-800">
                  ID: {request.vehicle.id} - {formatPlate(request.vehicle.plate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
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
