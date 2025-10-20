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
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  File,
  Image as ImageIcon,
  X,
  Eye,
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
  getDriverRequestById,
  approveDriverRequest,
  rejectDriverRequest,
  type DriverRequest,
} from "@/services/requests"
import { buildApiUrl } from "@/lib/api-client"

import { RequestStatusBadge } from "../../RequestStatusBadge"
import {
  formatCPF,
  formatPhone,
  formatDateTime,
  formatCNHCategory,
} from "@/lib/formatters"

export default function DriverRequestDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [request, setRequest] = useState<DriverRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const [approveDialog, setApproveDialog] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [documentModal, setDocumentModal] = useState<{
    open: boolean;
    url: string;
    title: string;
  }>({
    open: false,
    url: '',
    title: '',
  })

  const getDocumentUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Remove leading slash if exists
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `http://127.0.0.1:8000/${cleanPath}`;
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
      const data = await getDriverRequestById(Number(id))
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
      await approveDriverRequest(request.id)
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
      await rejectDriverRequest(request.id, rejectionReason)
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
        <User className="h-12 w-12 text-muted-foreground mb-4" />
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
      {/* Header com fundo */}
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
                  Solicitação #{request.id} - {request.name}
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
          {/* Dados Pessoais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-0">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                <p className="text-sm mt-1 font-medium">{request.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                <p className="text-sm mt-1 font-medium">{formatCPF(request.cpf)}</p>
              </div>
              {request.birth_date && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                  <p className="text-sm mt-1">{new Date(request.birth_date).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              {request.gender_display && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sexo</Label>
                  <p className="text-sm mt-1">{request.gender_display}</p>
                </div>
              )}
              {request.nationality && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nacionalidade</Label>
                  <p className="text-sm mt-1">{request.nationality}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-0">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm mt-1">{request.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                <p className="text-sm mt-1">{formatPhone(request.phone)}</p>
              </div>
              {request.whatsapp && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                  <p className="text-sm mt-1">{formatPhone(request.whatsapp)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          {request.address && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">{request.address}</p>
                {request.reference_point && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium text-muted-foreground">Ponto de Referência</Label>
                    <p className="text-sm mt-1">{request.reference_point}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* CNH */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Carteira Nacional de Habilitação
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-0">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Número da CNH</Label>
                <p className="text-sm mt-1 font-medium">{request.license_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                <p className="text-sm mt-1">{formatCNHCategory(request.license_category)}</p>
              </div>
              {request.license_expiry_date && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Validade</Label>
                  <p className="text-sm mt-1">{new Date(request.license_expiry_date).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </CardContent>
          </Card>

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

          {/* Documentos */}
          {(request.document || request.cnh_digital || request.photo) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <File className="h-4 w-4" />
                  Documentos Anexados
                </CardTitle>
                <CardDescription className="text-xs">
                  Clique em "Ver" para visualizar o documento em tela cheia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {request.document && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500 rounded-lg">
                        <File className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-900">Documento de Identificação</p>
                        <p className="text-[10px] text-blue-700">Arquivo PDF</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs"
                      onClick={() => setDocumentModal({
                        open: true,
                        url: request.document!,
                        title: 'Documento de Identificação',
                      })}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                )}
                {request.cnh_digital && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-500 rounded-lg">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-900">CNH Digital</p>
                        <p className="text-[10px] text-green-700">Arquivo PDF</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                      onClick={() => setDocumentModal({
                        open: true,
                        url: request.cnh_digital!,
                        title: 'CNH Digital',
                      })}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                )}
                {request.photo && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-500 rounded-lg">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-purple-900">Foto do Motorista</p>
                        <p className="text-[10px] text-purple-700">Imagem JPG/PNG</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs"
                      onClick={() => setDocumentModal({
                        open: true,
                        url: request.photo!,
                        title: 'Foto do Motorista',
                      })}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                )}
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

          {/* Condutor Criado */}
          {request.conductor && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 text-base">Condutor Criado</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-green-900">
                  ID: {request.conductor.id} - {request.conductor.name}
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
              Tem certeza que deseja aprovar a solicitação de <strong>{request.name}</strong>?
              <br /><br />
              Esta ação irá criar automaticamente o cadastro do motorista no sistema.
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
              Informe o motivo da reprovação para <strong>{request.name}</strong>
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

      {/* Document Viewer Modal */}
      {documentModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80">
          <div className="fixed inset-0 overflow-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-7xl h-[95vh] bg-white rounded-lg shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-lg">
                  <h2 className="text-lg font-semibold text-gray-900">{documentModal.title}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-100"
                    onClick={() => setDocumentModal({ open: false, url: '', title: '' })}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-lg">
                  {documentModal.url && (
                    documentModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div className="w-full h-full flex items-center justify-center p-6">
                        <img
                          src={getDocumentUrl(documentModal.url)}
                          alt={documentModal.title}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg bg-white"
                        />
                      </div>
                    ) : (
                      <embed
                        src={getDocumentUrl(documentModal.url)}
                        type="application/pdf"
                        className="w-full h-full"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
