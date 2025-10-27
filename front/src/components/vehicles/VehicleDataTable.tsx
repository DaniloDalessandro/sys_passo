"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable, PaginationState } from "@/components/ui/data-table";
import { Vehicle } from "@/hooks/useVehicles";

interface VehicleDataTableProps {
  vehicles: Vehicle[];
  totalCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onAdd: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  isLoading?: boolean;
}

const STORAGE_KEY = "vehicle-table-column-visibility";

const DEFAULT_VISIBLE_COLUMNS = [
  "placa",
  "marca",
  "modelo",
  "ano",
  "categoria",
  "status"
];

export function VehicleDataTable({
  vehicles,
  totalCount,
  pagination,
  onPaginationChange,
  filters,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
}: VehicleDataTableProps) {

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }

    const allColumns = [
      "placa", "marca", "modelo", "ano", "cor", "chassi", "renavam",
      "categoria", "combustivel", "capacidade", "status",
      "created_at", "updated_at", "created_by_username", "updated_by_username"
    ];

    const initialVisibility: Record<string, boolean> = {};
    allColumns.forEach(col => {
      initialVisibility[col] = DEFAULT_VISIBLE_COLUMNS.includes(col);
    });

    return initialVisibility;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

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

  const columns = useMemo(
    () => [
      { accessorKey: "placa", header: "Placa", meta: { showFilterIcon: true } },
      { accessorKey: "marca", header: "Marca", meta: { showFilterIcon: true } },
      { accessorKey: "modelo", header: "Modelo", meta: { showFilterIcon: true } },
      { accessorKey: "ano", header: "Ano", meta: { showFilterIcon: true } },
      { accessorKey: "cor", header: "Cor", meta: { showFilterIcon: true } },
      { accessorKey: "chassi", header: "Chassi", meta: { showFilterIcon: true } },
      { accessorKey: "renavam", header: "RENAVAM", meta: { showFilterIcon: true } },
      { accessorKey: "categoria", header: "Categoria", meta: { showFilterIcon: true } },
      { accessorKey: "combustivel", header: "Combustível", meta: { showFilterIcon: true } },
      { accessorKey: "capacidade", header: "Capacidade", meta: { showFilterIcon: true } },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          showFilterIcon: true,
          filterType: "select",
          filterOptions: [
            { value: "all", label: "Todos" },
            { value: "ativo", label: "Ativo" },
            { value: "inativo", label: "Inativo" },
          ],
          filterValue: filters?.status || "ativo",
          onFilterChange: (value: any) => onFilterChange("status", value === "all" ? "" : value),
        },
        cell: ({ row }: any) => {
          const status = row.getValue("status") as string;
          return getStatusLabel(status);
        },
      },
      {
        accessorKey: "created_at",
        header: "Criado em",
        cell: ({ row }: any) => format(new Date(row.getValue("created_at")), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      },
      {
        accessorKey: "updated_at",
        header: "Atualizado em",
        cell: ({ row }: any) => format(new Date(row.getValue("updated_at")), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      },
      {
        accessorKey: "created_by_username",
        header: "Criado por",
        cell: ({ row }: any) => row.getValue("created_by_username") || "-",
      },
      {
        accessorKey: "updated_by_username",
        header: "Atualizado por",
        cell: ({ row }: any) => row.getValue("updated_by_username") || "-",
      },
    ],
    [filters, onFilterChange]
  );

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <DataTable
        columns={columns}
        data={vehicles}
        title="Lista de Veículos"
        totalCount={totalCount}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        initialFilters={[
          { id: 'status', value: filters?.status || 'ativo' }
        ]}
        onPageChange={(pageIndex) => onPaginationChange({ ...pagination, pageIndex })}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        isLoading={isLoading}
        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
