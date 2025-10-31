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
import { PDFViewer } from "@/components/PDFViewer"

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

  const [pdfModal, setPdfModal] = useState<{
    open: boolean;
    url: string;
    title: string;
  }>({
    open: false,
    url: '',
    title: '',
  })

  const getPdfEndpointUrl = (requestId: number, type: 'crlv' | 'insurance') => {
    const endpoint = type === 'crlv' ? 'crlv-pdf' : 'insurance-pdf';
    return `http://127.0.0.1:8000/api/requests/vehicles/${requestId}/${endpoint}/`;
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

      // Mark as viewed if not already viewed
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header fixo com fundo gradiente */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/solicitacoes')}
                className="hover:bg-white/20 text-white h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Solicitação de Veículo</h1>
                <p className="text-sm text-indigo-100">
                  #{request.id} - {request.brand} {request.model}
                </p>
              </div>
            </div>
            <RequestStatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {/* Content com scroll */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4">
            {/* Dados do Veículo */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  Dados do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Documentação
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Gauge className="h-5 w-5 text-white" />
                  </div>
                  Características
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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

            {/* Documentos PDF */}
            {(request.crlv_pdf || request.insurance_pdf) && (
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg text-cyan-900">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Documentos do Veículo
                  </CardTitle>
                  <CardDescription className="text-xs text-cyan-700">
                    Clique em "Ver PDF" para visualizar o documento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {request.crlv_pdf && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500 rounded-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-900">CRLV</p>
                          <p className="text-[10px] text-blue-700">Certificado de Registro e Licenciamento</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                        onClick={() => {
                          const pdfUrl = getPdfEndpointUrl(request.id, 'crlv');
                          setPdfModal({
                            open: true,
                            url: pdfUrl,
                            title: 'CRLV - Certificado de Registro e Licenciamento',
                          });
                        }}
                      >
                        Ver PDF
                      </Button>
                    </div>
                  )}
                  {request.insurance_pdf && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-500 rounded-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-900">Seguro do Veículo</p>
                          <p className="text-[10px] text-green-700">Documento do Seguro</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                        onClick={() => {
                          const pdfUrl = getPdfEndpointUrl(request.id, 'insurance');
                          setPdfModal({
                            open: true,
                            url: pdfUrl,
                            title: 'Seguro do Veículo',
                          });
                        }}
                      >
                        Ver PDF
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fotos */}
            {(request.photo_1 || request.photo_2 || request.photo_3 || request.photo_4 || request.photo_5) && (
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Fotos do Veículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
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
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg text-pink-900">
                    <div className="p-2 bg-pink-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm p-3 bg-muted rounded-md">{request.message}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Ações */}
            {request.status === 'em_analise' && (
              <Card className="border-0 shadow-lg sticky top-4">
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
                  <CardTitle className="text-lg text-gray-900">Ações</CardTitle>
                  <CardDescription className="text-xs">
                    Analise a solicitação e tome uma decisão
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-10 text-sm font-medium shadow-md"
                    onClick={() => setApproveDialog(true)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar Solicitação
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full h-10 text-sm font-medium shadow-md"
                    onClick={() => setRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Recusar Solicitação
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Informações da Solicitação */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <div className="p-2 bg-gray-500 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
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
              <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
                <CardHeader className="pb-4">
                  <CardTitle className="text-red-800 text-lg font-bold flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Motivo da Reprovação
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-red-900 font-medium">{request.rejection_reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Veículo Criado */}
            {request.vehicle && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-4">
                  <CardTitle className="text-green-800 text-lg font-bold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Veículo Criado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-green-900 font-medium">
                    ID: {request.vehicle.id} - {formatPlate(request.vehicle.plate)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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

      {/* PDF Viewer Modal */}
      <PDFViewer
        open={pdfModal.open}
        onOpenChange={(open) => setPdfModal({ ...pdfModal, open })}
        pdfUrl={pdfModal.url}
        title={pdfModal.title}
      />
    </div>
  )
}
