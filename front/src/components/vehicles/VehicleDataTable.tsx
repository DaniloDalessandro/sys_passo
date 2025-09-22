"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable } from "@/components/ui/data-table";
import { Vehicle } from "@/hooks/useVehicles";

interface VehicleDataTableProps {
  vehicles: Vehicle[];
  onAdd: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  isLoading?: boolean;
}

export function VehicleDataTable({
  vehicles,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
}: VehicleDataTableProps) {
  const isMaintenanceDue = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "placa",
        header: "Placa",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const vehicle = row.original as Vehicle;
          return vehicle.placa;
        },
      },
      {
        accessorKey: "marca",
        header: "Marca/Modelo",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const vehicle = row.original as Vehicle;
          return (
            <div className="space-y-1">
              <div>{vehicle.marca} {vehicle.modelo}</div>
              <div className="text-xs text-gray-500">
                {vehicle.ano} • {vehicle.cor}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "categoria",
        header: "Categoria",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const vehicle = row.original as Vehicle;
          return (
            <div className="space-y-1">
              <div>{vehicle.categoria}</div>
              <div className="text-xs text-gray-500">
                {vehicle.combustivel}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "capacidade",
        header: "Capacidade",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const vehicle = row.original as Vehicle;
          return vehicle.capacidade || "N/A";
        },
      },
      {
        accessorKey: "proximaManutencao",
        header: "Manutenção",
        cell: ({ row }: any) => {
          const vehicle = row.original as Vehicle;
          return (
            <div className="space-y-1">
              <div>
                {format(new Date(vehicle.proximaManutencao), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
                {vehicle.status === 'manutencao' && " (Em andamento)"}
                {vehicle.status !== 'manutencao' && isMaintenanceDue(vehicle.proximaManutencao) && " (Próxima)"}
              </div>
              <div className="text-xs text-gray-500">
                {vehicle.kmRodados.toLocaleString("pt-BR")} km
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const status = row.getValue("status") as string;
          const getStatusLabel = (status: string) => {
            switch (status) {
              case "ativo":
                return "Ativo";
              case "manutencao":
                return "Manutenção";
              case "inativo":
                return "Inativo";
              default:
                return status;
            }
          };
          return getStatusLabel(status);
        },
      },
      {
        accessorKey: "created_at",
        header: "Criado em",
        cell: ({ row }: any) => {
          const date = row.getValue("created_at") as string;
          return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
        },
      },
      {
        accessorKey: "updated_at",
        header: "Atualizado em",
        cell: ({ row }: any) => {
          const date = row.getValue("updated_at") as string;
          return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
        },
      },
    ],
    [onViewDetails]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando veículos...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <DataTable
        columns={columns}
        data={vehicles}
        title="Lista de Veículos"
        pageSize={10}
        pageIndex={0}
        totalCount={vehicles.length}
        onAdd={onAdd}
        onViewDetails={onViewDetails}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onFilterChange={() => {}}
        onSortingChange={() => {}}
        readOnly={false}
      />
    </div>
  );
}