"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Edit, Car, Wrench, FileText, Settings } from "lucide-react";
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
import { Vehicle } from "@/hooks/useVehicles";

interface VehicleDetailDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (vehicle: Vehicle) => void;
}

export function VehicleDetailDialog({
  vehicle,
  open,
  onOpenChange,
  onEdit,
}: VehicleDetailDialogProps) {
  // Force re-render when state changes
  useEffect(() => {
    // Effect for handling dialog state changes
  }, [open, vehicle]);

  const isMaintenanceDue = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'ativo': 'default',
      'inativo': 'secondary'
    };
    return variants[status] || 'outline';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ativo': 'Ativo',
      'inativo': 'Inativo'
    };
    return labels[status] || status;
  };

  if (!vehicle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {vehicle.marca} {vehicle.modelo}
                </DialogTitle>
                <DialogDescription>
                  Placa: {vehicle.placa} • {vehicle.ano}
                </DialogDescription>
              </div>
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vehicle)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>

          {vehicle.proximaManutencao && isMaintenanceDue(vehicle.proximaManutencao) && (
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A manutenção deste veículo está próxima!
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <Tabs defaultValue="dados" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Dados do Veículo
            </TabsTrigger>
            <TabsTrigger value="fotos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fotos
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-600 text-sm">Placa:</strong>
                  <div className="text-gray-900 font-mono">{vehicle.placa}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Marca:</strong>
                  <div className="text-gray-900">{vehicle.marca}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Modelo:</strong>
                  <div className="text-gray-900">{vehicle.modelo}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <strong className="text-gray-600 text-sm">Ano:</strong>
                  <div className="text-gray-900">{vehicle.ano}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Cor:</strong>
                  <div className="text-gray-900">{vehicle.cor}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Categoria:</strong>
                  <div className="text-gray-900">{vehicle.categoria}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <strong className="text-gray-600 text-sm">Combustível:</strong>
                  <div className="text-gray-900">{vehicle.combustivel}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Capacidade:</strong>
                  <div className="text-gray-900">{vehicle.capacidade}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">Status:</strong>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                      {getStatusLabel(vehicle.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Documentação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <strong className="text-gray-600 text-sm">Chassi:</strong>
                  <div className="text-gray-900 font-mono">{vehicle.chassi}</div>
                </div>
                <div>
                  <strong className="text-gray-600 text-sm">RENAVAM:</strong>
                  <div className="text-gray-900 font-mono">{vehicle.renavam}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fotos" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicle.photo_1 && (
                <div className="space-y-2">
                  <strong className="text-gray-600 text-sm">Foto 1:</strong>
                  <img
                    src={vehicle.photo_1}
                    alt="Foto 1 do veículo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {vehicle.photo_2 && (
                <div className="space-y-2">
                  <strong className="text-gray-600 text-sm">Foto 2:</strong>
                  <img
                    src={vehicle.photo_2}
                    alt="Foto 2 do veículo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {vehicle.photo_3 && (
                <div className="space-y-2">
                  <strong className="text-gray-600 text-sm">Foto 3:</strong>
                  <img
                    src={vehicle.photo_3}
                    alt="Foto 3 do veículo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {vehicle.photo_4 && (
                <div className="space-y-2">
                  <strong className="text-gray-600 text-sm">Foto 4:</strong>
                  <img
                    src={vehicle.photo_4}
                    alt="Foto 4 do veículo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {vehicle.photo_5 && (
                <div className="space-y-2">
                  <strong className="text-gray-600 text-sm">Foto 5:</strong>
                  <img
                    src={vehicle.photo_5}
                    alt="Foto 5 do veículo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            {!vehicle.photo_1 && !vehicle.photo_2 && !vehicle.photo_3 && !vehicle.photo_4 && !vehicle.photo_5 && (
              <div className="text-center text-gray-500 py-8">
                Nenhuma foto cadastrada para este veículo.
              </div>
            )}
          </TabsContent>

          <TabsContent value="manutencao" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <strong className="text-gray-600 text-sm">KM Rodados:</strong>
                <div className="text-gray-900 text-lg font-semibold">
                  {vehicle.kmRodados.toLocaleString("pt-BR")} km
                </div>
              </div>
              <div>
                <strong className="text-gray-600 text-sm">Última Manutenção:</strong>
                <div className="text-gray-900">
                  {format(new Date(vehicle.ultimaManutencao), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </div>
              </div>
              <div>
                <strong className="text-gray-600 text-sm">Próxima Manutenção:</strong>
                <div className="text-gray-900">
                  {vehicle.proximaManutencao && format(new Date(vehicle.proximaManutencao), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                  {vehicle.proximaManutencao && isMaintenanceDue(vehicle.proximaManutencao) && (
                    <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                      Próxima
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <strong className="text-gray-600 text-sm">Data de Criação:</strong>
                <div className="text-gray-900">
                  {format(new Date(vehicle.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
                {vehicle.created_by_username && (
                  <div className="text-xs text-gray-500 mt-1">
                    Criado por: {vehicle.created_by_username}
                  </div>
                )}
              </div>
              <div>
                <strong className="text-gray-600 text-sm">Última Atualização:</strong>
                <div className="text-gray-900">
                  {format(new Date(vehicle.updated_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
                {vehicle.updated_by_username && (
                  <div className="text-xs text-gray-500 mt-1">
                    Atualizado por: {vehicle.updated_by_username}
                  </div>
                )}
              </div>
            </div>

            {vehicle.condutores && vehicle.condutores.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Condutores Vinculados</h3>
                <div className="space-y-2">
                  {vehicle.condutores.map((condutor) => (
                    <div key={condutor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{condutor.nome}</div>
                        <div className="text-sm text-gray-500">CPF: {condutor.cpf}</div>
                      </div>
                      <Badge variant="outline">
                        CNH: {condutor.license_category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}