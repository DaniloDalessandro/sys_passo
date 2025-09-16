"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Edit } from "lucide-react";
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

  if (!conductor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="space-y-6">
          {(conductor.is_license_expired || isLicenseExpiringSoon(conductor.license_expiry_date)) && (
            <Alert variant={conductor.is_license_expired ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {conductor.is_license_expired
                  ? "A CNH deste condutor está vencida!"
                  : "A CNH deste condutor vence em breve!"}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dados Pessoais</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <strong className="text-gray-600">Nome:</strong>
                  <span className="text-gray-900">{conductor.name}</span>
                </div>
                <div className="flex flex-col">
                  <strong className="text-gray-600">CPF:</strong>
                  <span className="text-gray-900">{conductor.cpf}</span>
                </div>
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
                {conductor.address && (
                  <div className="flex flex-col">
                    <strong className="text-gray-600">Endereço:</strong>
                    <span className="text-gray-900">{conductor.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dados da CNH</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <strong className="text-gray-600">Número da CNH:</strong>
                  <span className="text-gray-900">{conductor.license_number}</span>
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
                  <strong className="text-gray-600">Validade:</strong>
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
                <div className="flex flex-col">
                  <strong className="text-gray-600">Status:</strong>
                  <div className="mt-1">
                    <Badge variant={conductor.is_active ? "default" : "secondary"}>
                      {conductor.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">Informações do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

          <div className="flex gap-2 pt-4 border-t">
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