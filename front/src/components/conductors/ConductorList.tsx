"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle, Phone, Mail, Users, Globe, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface Conductor {
  id: number
  name: string
  cpf: string
  email: string
  phone: string
  photo?: string
  birth_date?: string
  license_number: string
  license_category: string
  license_expiry_date: string
  address: string
  gender: 'M' | 'F' | 'O'
  nationality: string
  whatsapp?: string
  cnh_digital?: string
  is_active: boolean
  is_license_expired: boolean
}

interface ConductorListProps {
  conductors: Conductor[]
  onEdit?: (conductor: Conductor) => void
  onDelete?: (id: number) => void
  onView?: (conductor: Conductor) => void
  isLoading?: boolean
}

export function ConductorList({
  conductors,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}: ConductorListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [filteredConductors, setFilteredConductors] = useState<Conductor[]>(conductors)

  useEffect(() => {
    const filtered = conductors.filter(conductor =>
      conductor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.cpf.includes(searchTerm) ||
      conductor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conductor.phone.includes(searchTerm) ||
      (conductor.whatsapp && conductor.whatsapp.includes(searchTerm)) ||
      conductor.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredConductors(filtered)
  }, [conductors, searchTerm])

  const handleView = (conductor: Conductor) => {
    setSelectedConductor(conductor)
    setIsViewDialogOpen(true)
    onView?.(conductor)
  }

  const handleEdit = (conductor: Conductor) => {
    onEdit?.(conductor)
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este condutor?")) {
      onDelete?.(id)
    }
  }

  const isLicenseExpiringSoon = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const getCategoryBadgeVariant = (category: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'A': 'default',
      'B': 'secondary',
      'C': 'destructive',
      'D': 'outline',
      'E': 'default'
    }
    return variants[category] || 'outline'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando condutores...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
                  🚗
                </span>
                Lista de Condutores
              </CardTitle>
              <CardDescription>
                Gerencie os condutores cadastrados no sistema
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {filteredConductors.length} condutor{filteredConductors.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Input
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredConductors.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                {searchTerm ? "Nenhum condutor encontrado" : "Nenhum condutor cadastrado"}
              </div>
              {searchTerm && (
                <Button variant="ghost" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Categoria CNH</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConductors.map((conductor) => (
                    <TableRow key={conductor.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{conductor.name}</div>
                          <div className="text-sm text-gray-500 space-y-1">
                            {conductor.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {conductor.email}
                              </div>
                            )}
                            {conductor.gender && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {conductor.gender === 'M' ? 'Masculino' : conductor.gender === 'F' ? 'Feminino' : 'Outro'}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{conductor.cpf}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {conductor.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {conductor.phone}
                            </div>
                          )}
                          {conductor.whatsapp && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Phone className="h-3 w-3" />
                              {conductor.whatsapp} (WhatsApp)
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getCategoryBadgeVariant(conductor.license_category)}>
                            {conductor.license_category}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {conductor.license_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                            {conductor.is_license_expired && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Vencida
                              </Badge>
                            )}
                            {!conductor.is_license_expired && isLicenseExpiringSoon(conductor.license_expiry_date) && (
                              <Badge variant="secondary" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Vence em breve
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {conductor.photo && (
                              <Badge variant="outline" className="text-xs">
                                Foto
                              </Badge>
                            )}
                            {conductor.cnh_digital && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                CNH Digital
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conductor.is_active ? "default" : "secondary"}>
                          {conductor.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleView(conductor)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => handleEdit(conductor)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(conductor.id)}
                                className="cursor-pointer text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
                🚗
              </span>
              Detalhes do Condutor
            </DialogTitle>
            <DialogDescription>
              Informações completas do condutor selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedConductor && (
            <div className="space-y-6">
              {(selectedConductor.is_license_expired || isLicenseExpiringSoon(selectedConductor.license_expiry_date)) && (
                <Alert variant={selectedConductor.is_license_expired ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedConductor.is_license_expired
                      ? "A CNH deste condutor está vencida!"
                      : "A CNH deste condutor vence em breve!"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Dados Pessoais</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {selectedConductor.name}</div>
                    <div><strong>CPF:</strong> {selectedConductor.cpf}</div>
                    <div><strong>Email:</strong> {selectedConductor.email}</div>
                    <div>
                      <strong>Gênero:</strong> {' '}
                      {selectedConductor.gender === 'M' ? 'Masculino' : selectedConductor.gender === 'F' ? 'Feminino' : 'Outro'}
                    </div>
                    <div><strong>Nacionalidade:</strong> {selectedConductor.nationality}</div>
                    {selectedConductor.birth_date && (
                      <div><strong>Data de Nascimento:</strong> {format(new Date(selectedConductor.birth_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                    )}
                    {selectedConductor.address && (
                      <div><strong>Endereço:</strong> {selectedConductor.address}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contato</h3>
                  <div className="space-y-2 text-sm">
                    {selectedConductor.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <strong>Telefone:</strong> {selectedConductor.phone}
                      </div>
                    )}
                    {selectedConductor.whatsapp && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Phone className="h-3 w-3" />
                        <strong>WhatsApp:</strong> {selectedConductor.whatsapp}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dados da CNH</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Número:</strong> {selectedConductor.license_number}</div>
                    <div>
                      <strong>Categoria:</strong>{" "}
                      <Badge variant={getCategoryBadgeVariant(selectedConductor.license_category)}>
                        {selectedConductor.license_category}
                      </Badge>
                    </div>
                    <div>
                      <strong>Validade:</strong>{" "}
                      {format(new Date(selectedConductor.license_expiry_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                      {selectedConductor.is_license_expired && (
                        <Badge variant="destructive" className="ml-2">
                          Vencida
                        </Badge>
                      )}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <Badge variant={selectedConductor.is_active ? "default" : "secondary"}>
                        {selectedConductor.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Documentos</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <strong>Foto:</strong>
                      {selectedConductor.photo ? (
                        <Badge variant="outline" className="text-xs">
                          Disponível
                        </Badge>
                      ) : (
                        <span className="text-gray-500">Não informada</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>CNH Digital:</strong>
                      {selectedConductor.cnh_digital ? (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          PDF Disponível
                        </Badge>
                      ) : (
                        <span className="text-gray-500">Não informada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {onEdit && (
                  <Button onClick={() => handleEdit(selectedConductor)} size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} size="sm">
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}