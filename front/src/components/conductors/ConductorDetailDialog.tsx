"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Edit, User, CreditCard, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Conductor } from "@/hooks/useConductors";

interface ConductorDetailDialogProps {
  conductor: Conductor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (conductor: Conductor) => void;
}

export function ConductorDetailDialog({
  conductor,
  open,
  onOpenChange,
  onEdit,
}: ConductorDetailDialogProps) {
  // Force re-render when state changes
  useEffect(() => {
    // Effect for handling dialog state changes
  }, [open, conductor]);
  const isLicenseExpiringSoon = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const getCategoryBadgeVariant = (category: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'A': 'default',
      'B': 'secondary',
      'C': 'destructive',
      'D': 'outline',
      'E': 'default'
    };
    return variants[category] || 'outline';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'A': 'Motocicleta',
      'B': 'Carro',
      'C': 'Caminhão',
      'D': 'Ônibus',
      'E': 'Carreta',
      'AB': 'A+B',
      'AC': 'A+C',
      'AD': 'A+D',
      'AE': 'A+E'
    };
    return labels[category] || category;
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Feminino',
      'O': 'Outro'
    };
    return labels[gender] || gender;
  };

  if (!conductor) {
    return null;
  }

  return (
    <Dialog
      key={conductor.id}
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
              🚗
            </span>
            Detalhes do Condutor: {conductor.name}
          </DialogTitle>
          <DialogDescription>
            Informações completas do condutor selecionado
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[70vh]">
          {(conductor.is_license_expired || isLicenseExpiringSoon(conductor.license_expiry_date)) && (
            <Alert variant={conductor.is_license_expired ? "destructive" : "default"} className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {conductor.is_license_expired
                  ? "A CNH deste condutor está vencida!"
                  : "A CNH deste condutor vence em breve!"}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="personal" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="license" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                CNH
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Informações Básicas</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Nome Completo:</strong>
                      <span className="text-gray-900 font-medium">{conductor.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600">CPF:</strong>
                      <span className="text-gray-900 font-mono">{conductor.cpf}</span>
                    </div>
                    {conductor.birth_date && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600">Data de Nascimento:</strong>
                        <span className="text-gray-900">
                          {format(new Date(conductor.birth_date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                    {conductor.gender && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600">Gênero:</strong>
                        <span className="text-gray-900">{getGenderLabel(conductor.gender)}</span>
                      </div>
                    )}
                    {conductor.nationality && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600">Nacionalidade:</strong>
                        <span className="text-gray-900">{conductor.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Contato</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Email:</strong>
                      <span className="text-gray-900">{conductor.email}</span>
                    </div>
                    {conductor.phone && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600">Telefone:</strong>
                        <span className="text-gray-900">{conductor.phone}</span>
                      </div>
                    )}
                    {conductor.whatsapp && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600">WhatsApp:</strong>
                        <span className="text-gray-900">{conductor.whatsapp}</span>
                      </div>
                    )}
                    {conductor.address && (
                      <div className="flex flex-col">
                        <strong className="text-gray-600">Endereço:</strong>
                        <span className="text-gray-900">{conductor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="license" className="space-y-4 flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Dados da CNH</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Número da CNH:</strong>
                      <span className="text-gray-900 font-mono">{conductor.license_number}</span>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Categoria:</strong>
                      <div className="mt-1">
                        <Badge variant={getCategoryBadgeVariant(conductor.license_category)}>
                          {conductor.license_category} - {getCategoryLabel(conductor.license_category)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Data de Validade:</strong>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-900">
                          {format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                        {conductor.is_license_expired && (
                          <Badge variant="destructive">
                            Vencida
                          </Badge>
                        )}
                        {!conductor.is_license_expired && isLicenseExpiringSoon(conductor.license_expiry_date) && (
                          <Badge variant="secondary">
                            Vence em breve
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Status</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Status do Condutor:</strong>
                      <div className="mt-1">
                        <Badge variant={conductor.is_active ? "default" : "secondary"}>
                          {conductor.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Status da CNH:</strong>
                      <div className="mt-1">
                        <Badge variant={conductor.is_license_expired ? "destructive" : "default"}>
                          {conductor.is_license_expired ? "Vencida" : "Válida"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Arquivos Digitais</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Foto do Condutor:</strong>
                      <div className="mt-2">
                        {conductor.photo ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Arquivo disponível</Badge>
                            <Button size="sm" variant="outline">
                              Ver Foto
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-500">Não informado</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600">CNH Digital:</strong>
                      <div className="mt-2">
                        {conductor.cnh_digital ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Arquivo disponível</Badge>
                            <Button size="sm" variant="outline">
                              Ver CNH
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-500">Não informado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Informações Adicionais</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">
                        Os documentos digitais são armazenados de forma segura e podem ser acessados pelos administradores do sistema quando necessário.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4 flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Auditoria</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Criado em:</strong>
                      <span className="text-gray-900">
                        {format(new Date(conductor.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      {conductor.created_by_username && (
                        <span className="text-xs text-gray-500">
                          por {conductor.created_by_username}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <strong className="text-gray-600">Última atualização:</strong>
                      <span className="text-gray-900">
                        {format(new Date(conductor.updated_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      {conductor.updated_by_username && (
                        <span className="text-xs text-gray-500">
                          por {conductor.updated_by_username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Identificação</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <strong className="text-gray-600">ID do Condutor:</strong>
                      <span className="text-gray-900 font-mono">#{conductor.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t mt-4">
            {onEdit && (
              <Button onClick={() => onEdit(conductor)} size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}