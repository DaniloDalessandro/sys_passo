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
  markDriverRequestAsViewed,
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

      // Mark as viewed if not already viewed
      if (!data.viewed_at) {
        try {
          await markDriverRequestAsViewed(Number(id))
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header fixo com fundo gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
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
                <h1 className="text-2xl font-bold">Solicitação de Motorista</h1>
                <p className="text-sm text-blue-100">
                  #{request.id} - {request.name}
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
            {/* Dados Pessoais */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-green-900">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  Carteira Nacional de Habilitação
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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

            {/* Documentos */}
            {(request.document || request.cnh_digital || request.photo) && (
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg text-cyan-900">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                      <File className="h-5 w-5 text-white" />
                    </div>
                    Documentos Anexados
                  </CardTitle>
                  <CardDescription className="text-xs text-cyan-700">
                    Clique em "Ver" para visualizar o documento em tela cheia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
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
                    <AlertCircle className="h-5 w-5" />
                    Motivo da Reprovação
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-red-900 font-medium">{request.rejection_reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Condutor Criado */}
            {request.conductor && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-4">
                  <CardTitle className="text-green-800 text-lg font-bold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Condutor Criado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-green-900 font-medium">
                    ID: {request.conductor.id} - {request.conductor.name}
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
