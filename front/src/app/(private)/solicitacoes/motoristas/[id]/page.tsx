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
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  File,
  Image as ImageIcon,
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
import { PDFViewer } from "@/components/PDFViewer"

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

  const [pdfModal, setPdfModal] = useState<{
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
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `http://127.0.0.1:8000/${cleanPath}`;
  }

  const getPdfEndpointUrl = (requestId: number, type: 'document' | 'cnh') => {
    const endpoint = type === 'document' ? 'document-pdf' : 'cnh-pdf';
    return `http://127.0.0.1:8000/api/requests/drivers/${requestId}/${endpoint}/`;
  }

  const openPdfInNewTab = async (requestId: number, type: 'document' | 'cnh', title: string) => {
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
    if (!request) {
      return
    }

    // Validar apenas se foi preenchido algo e é muito curto
    if (rejectionReason && rejectionReason.trim().length > 0 && rejectionReason.trim().length < 10) {
      toast.error('Se informar o motivo da reprovação, ele deve ter pelo menos 10 caracteres')
      return
    }

    setIsActionLoading(true)
    try {
      await rejectDriverRequest(request.id, rejectionReason.trim())
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
                <h1 className="text-xl font-semibold text-gray-900">{request.name}</h1>
                <p className="text-sm text-gray-500">Protocolo #{request.id}</p>
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
            {/* Dados Pessoais */}
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Nome Completo</Label>
                  <p className="text-sm font-medium mt-1">{request.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">CPF</Label>
                  <p className="text-sm font-medium mt-1">{formatCPF(request.cpf)}</p>
                </div>
                {request.birth_date && (
                  <div>
                    <Label className="text-xs text-gray-500">Data de Nascimento</Label>
                    <p className="text-sm mt-1">{new Date(request.birth_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {request.gender_display && (
                  <div>
                    <Label className="text-xs text-gray-500">Sexo</Label>
                    <p className="text-sm mt-1">{request.gender_display}</p>
                  </div>
                )}
                {request.nationality && (
                  <div>
                    <Label className="text-xs text-gray-500">Nacionalidade</Label>
                    <p className="text-sm mt-1">{request.nationality}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                Contato
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="text-sm mt-1">{request.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Telefone</Label>
                  <p className="text-sm mt-1">{formatPhone(request.phone)}</p>
                </div>
                {request.whatsapp && (
                  <div>
                    <Label className="text-xs text-gray-500">WhatsApp</Label>
                    <p className="text-sm mt-1">{formatPhone(request.whatsapp)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Endereço */}
            {request.address && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  Endereço
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Endereço Completo</Label>
                    <p className="text-sm mt-1">{request.address}</p>
                  </div>
                  {request.reference_point && (
                    <div>
                      <Label className="text-xs text-gray-500">Ponto de Referência</Label>
                      <p className="text-sm mt-1">{request.reference_point}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CNH */}
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                CNH
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Número</Label>
                  <p className="text-sm font-medium mt-1">{request.license_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Categoria</Label>
                  <p className="text-sm mt-1">{formatCNHCategory(request.license_category)}</p>
                </div>
                {request.license_expiry_date && (
                  <div>
                    <Label className="text-xs text-gray-500">Validade</Label>
                    <p className="text-sm mt-1">{new Date(request.license_expiry_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentos */}
            {(request.document || request.cnh_digital || request.photo) && (
              <div className="bg-white rounded-lg p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <File className="h-4 w-4 text-cyan-600" />
                  Documentos
                </h2>
                <div className="space-y-2">
                  {request.document && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Documento de Identificação</p>
                          <p className="text-xs text-gray-500">PDF</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openPdfInNewTab(request.id, 'document', 'Documento de Identificação')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                  {request.cnh_digital && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">CNH Digital</p>
                          <p className="text-xs text-gray-500">PDF</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openPdfInNewTab(request.id, 'cnh', 'CNH Digital')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                  {request.photo && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Foto</p>
                          <p className="text-xs text-gray-500">Imagem</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setDocumentModal({
                          open: true,
                          url: request.photo!,
                          title: 'Foto do Motorista',
                        })}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
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

            {/* Condutor Criado */}
            {request.conductor && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-base font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Criado
                </h3>
                <p className="text-sm text-green-800">
                  ID: {request.conductor.id} - {request.conductor.name}
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

      <Dialog open={rejectDialog} onOpenChange={(open) => {
        setRejectDialog(open)
        if (!open) setRejectionReason('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Solicitação</DialogTitle>
            <DialogDescription>
              Você pode informar o motivo da reprovação para <strong>{request.name}</strong> (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Motivo da Reprovação <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Digite o motivo da reprovação (opcional, mas recomendado)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              {rejectionReason && rejectionReason.trim().length > 0 && rejectionReason.trim().length < 10 && (
                <p className="text-xs text-destructive">
                  Se preenchido, o motivo deve ter pelo menos 10 caracteres
                </p>
              )}
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
              disabled={isActionLoading}
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setDocumentModal({ open: false, url: '', title: '' })}>
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
              <h3 className="font-semibold">{documentModal.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDocumentModal({ open: false, url: '', title: '' })}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <img
                src={getDocumentUrl(documentModal.url)}
                alt={documentModal.title}
                className="max-w-full max-h-[calc(90vh-100px)] mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      <PDFViewer
        open={pdfModal.open}
        onOpenChange={(open) => setPdfModal({ ...pdfModal, open })}
        pdfUrl={pdfModal.url}
        title={pdfModal.title}
      />
    </div>
  )
}
