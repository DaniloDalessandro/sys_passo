"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useComplaints, Complaint } from "@/hooks/useComplaints"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react"
import { formatDate, formatDateTime, formatPhone } from "@/lib/formatters"

export default function ComplaintDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const {
    getComplaint,
    updateComplaintStatus,
    updateComplaint,
  } = useComplaints()

  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Edit state
  const [editingStatus, setEditingStatus] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [resolutionNotes, setResolutionNotes] = useState<string>("")

  useEffect(() => {
    const loadComplaint = async () => {
      if (!id) return

      setIsLoading(true)
      try {
        const data = await getComplaint(Number(id))
        setComplaint(data)
        setEditingStatus(data.status)
        setAdminNotes(data.admin_notes || "")
        setResolutionNotes(data.resolution_notes || "")
      } catch (error) {
        toast.error("Erro ao carregar denúncia")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadComplaint()
  }, [id, getComplaint])

  const handleStatusChange = async () => {
    if (!complaint) return

    if (editingStatus === complaint.status) {
      toast.info("O status não foi alterado")
      return
    }

    setIsActionLoading(true)
    try {
      await updateComplaintStatus(complaint.id, editingStatus)
      toast.success("Status atualizado com sucesso!")

      // Reload complaint
      const updatedComplaint = await getComplaint(complaint.id)
      setComplaint(updatedComplaint)
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status")
    } finally {
      setIsActionLoading(false)
    }
  }


  const handleNotesUpdate = async () => {
    if (!complaint) return

    const hasAdminNotesChanged = adminNotes !== (complaint.admin_notes || "")
    const hasResolutionNotesChanged = resolutionNotes !== (complaint.resolution_notes || "")

    if (!hasAdminNotesChanged && !hasResolutionNotesChanged) {
      toast.info("As notas não foram alteradas")
      return
    }

    setIsActionLoading(true)
    try {
      const updateData: any = {}
      if (hasAdminNotesChanged) updateData.admin_notes = adminNotes
      if (hasResolutionNotesChanged) updateData.resolution_notes = resolutionNotes

      await updateComplaint(complaint.id, updateData)
      toast.success("Notas atualizadas com sucesso!")

      // Reload complaint
      const updatedComplaint = await getComplaint(complaint.id)
      setComplaint(updatedComplaint)
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar notas")
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="h-12 w-12 text-orange-600" />
        <h1 className="text-2xl font-bold">Denúncia não encontrada</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header fixo */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h1 className="text-xl font-bold">Denúncia #{complaint.id}</h1>
                <p className="text-sm text-muted-foreground">Protocolo: {complaint.protocol}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Status:</Label>
            <Select value={editingStatus} onValueChange={setEditingStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposto">Proposto</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
            {editingStatus !== complaint.status && (
              <Button
                size="sm"
                onClick={handleStatusChange}
                disabled={isActionLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo em grid 2 colunas */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* COLUNA ESQUERDA */}

          {/* Informações do Veículo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">Informações do Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Placa</Label>
                <p className="text-sm font-mono font-bold mt-1">{complaint.vehicle_plate}</p>
              </div>
              {complaint.vehicle && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Marca</Label>
                      <p className="text-sm mt-1">{complaint.vehicle.brand}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Modelo</Label>
                      <p className="text-sm mt-1">{complaint.vehicle.model}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Ano</Label>
                      <p className="text-sm mt-1">{complaint.vehicle.year}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Cor</Label>
                      <p className="text-sm mt-1">{complaint.vehicle.color}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Informações da Denúncia */}
          <Card className="lg:row-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">Informações da Denúncia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Denúncia</Label>
                <p className="text-sm mt-1 font-medium">{complaint.complaint_type_display}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <div className="text-sm mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {complaint.description}
                </div>
              </div>

              {complaint.occurrence_date && (
                <div>
                  <Label className="text-xs text-muted-foreground">Data da Ocorrência</Label>
                  <p className="text-sm mt-1">{formatDate(complaint.occurrence_date)}</p>
                </div>
              )}

              {complaint.occurrence_location && (
                <div>
                  <Label className="text-xs text-muted-foreground">Local da Ocorrência</Label>
                  <p className="text-sm mt-1">{complaint.occurrence_location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Denunciante */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">Informações do Denunciante</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.is_anonymous ? (
                <p className="text-sm text-muted-foreground italic">Denúncia anônima</p>
              ) : (
                <div className="space-y-3">
                  {complaint.complainant_name && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Nome</Label>
                      <p className="text-sm mt-1">{complaint.complainant_name}</p>
                    </div>
                  )}
                  {complaint.complainant_email && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm mt-1">{complaint.complainant_email}</p>
                    </div>
                  )}
                  {complaint.complainant_phone && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Telefone</Label>
                      <p className="text-sm mt-1">{formatPhone(complaint.complainant_phone)}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fotos da Denúncia */}
          {complaint.photos && complaint.photos.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-orange-600">Fotos Anexadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {complaint.photos.map((photo, index) => (
                    <a
                      key={photo.id}
                      href={photo.photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-400 transition-all cursor-pointer"
                    >
                      <img
                        src={photo.photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">Foto {index + 1}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas Internas */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">Notas Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Adicione notas internas sobre esta denúncia..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                {adminNotes !== (complaint.admin_notes || "") && (
                  <Button
                    size="sm"
                    onClick={handleNotesUpdate}
                    disabled={isActionLoading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Notas Internas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notas de Resolução */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">Notas de Resolução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Adicione notas sobre a resolução desta denúncia..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                {resolutionNotes !== (complaint.resolution_notes || "") && (
                  <Button
                    size="sm"
                    onClick={handleNotesUpdate}
                    disabled={isActionLoading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Notas de Resolução
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Data de Criação</Label>
                  <p className="text-sm mt-1">{formatDateTime(complaint.created_at)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Última Atualização</Label>
                  <p className="text-sm mt-1">{formatDateTime(complaint.updated_at)}</p>
                </div>
                {complaint.reviewed_by && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Analisado por</Label>
                      <p className="text-sm mt-1">
                        {complaint.reviewed_by.username}
                      </p>
                    </div>
                    {complaint.reviewed_at && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Data da Análise</Label>
                        <p className="text-sm mt-1">{formatDateTime(complaint.reviewed_at)}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
