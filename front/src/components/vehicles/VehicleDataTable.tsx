"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable } from "@/components/ui/data-table";
import { Vehicle } from "@/hooks/useVehicles";

interface VehicleDataTableProps {
  vehicles: Vehicle[];
  onAdd: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
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
  const [statusFilter, setStatusFilter] = useState<string>("");

  const isMaintenanceDue = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "inativo":
        return "Inativo";
      default:
        return status;
    }
  };

  const filteredVehicles = useMemo(() => {
    if (statusFilter === "Todos" || !statusFilter) {
      return vehicles;
    }
    return vehicles.filter((vehicle) => {
      const statusLabel = getStatusLabel(vehicle.status);
      return statusLabel === statusFilter;
    });
  }, [vehicles, statusFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "plate",
        header: "Placa",
      },
      {
        accessorKey: "brand",
        header: "Marca",
      },
      {
        accessorKey: "model",
        header: "Modelo",
      },
      {
        accessorKey: "year",
        header: "Ano",
      },
      {
        accessorKey: "kmRodados",
        header: "KM Rodados",
        cell: ({ row }: any) => {
            const vehicle = row.original as Vehicle;
            return `${vehicle.kmRodados.toLocaleString("pt-BR")} km`;
        }
      },
      {
        accessorKey: "proximaManutencao",
        header: "Próxima Manutenção",
        cell: ({ row }: any) => {
          const vehicle = row.original as Vehicle;
          if (!vehicle.proximaManutencao) return '-';
          const formattedDate = format(new Date(vehicle.proximaManutencao), "dd/MM/yyyy", {
            locale: ptBR,
          });
          if (isMaintenanceDue(vehicle.proximaManutencao)) return `${formattedDate} (Próxima)`;
          return formattedDate;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          filterType: "select",
          filterOptions: [
            { value: "Todos", label: "Todos" },
            { value: "Ativo", label: "Ativo" },
            { value: "Inativo", label: "Inativo" },
          ],
          filterValue: statusFilter,
          onFilterChange: setStatusFilter,
        },
        cell: ({ row }: any) => {
          const status = row.getValue("status") as string;
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
    [statusFilter]
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
        data={filteredVehicles}
        title="Lista de Veículos"
        pageSize={10}
        pageIndex={0}
        totalCount={filteredVehicles.length}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
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
