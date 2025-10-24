"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable, PaginationState } from "@/components/ui/data-table";
import { Complaint } from "@/hooks/useComplaints";

interface ComplaintDataTableProps {
  complaints: Complaint[];
  totalCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onAdd?: () => void;
  onEdit?: (complaint: Complaint) => void;
  onDelete?: (complaint: Complaint) => void;
  onViewDetails?: (complaint: Complaint) => void;
  isLoading?: boolean;
}

const STORAGE_KEY = "complaint-table-column-visibility";

const DEFAULT_VISIBLE_COLUMNS = [
  "vehicle_plate",
  "complaint_type_display",
  "status",
  "created_at"
];

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    proposto: "Proposto",
    em_analise: "Em Análise",
    concluido: "Concluído",
  };
  return labels[status] || status;
};

export function ComplaintDataTable({
  complaints,
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
}: ComplaintDataTableProps) {

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }

    const allColumns = [
      "vehicle_plate", "complaint_type_display", "description",
      "occurrence_date", "occurrence_location", "complainant_name",
      "is_anonymous", "status", "created_at", "updated_at"
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "vehicle_plate",
        header: "Placa",
        meta: { showFilterIcon: true },
        cell: ({ row }: any) => {
          const plate = row.getValue("vehicle_plate") as string;
          return <span className="font-mono font-semibold">{plate}</span>;
        },
      },
      {
        accessorKey: "complaint_type_display",
        header: "Tipo",
        meta: {
          showFilterIcon: true,
          filterType: "select",
          filterOptions: [
            { value: "all", label: "Todos" },
            { value: "excesso_velocidade", label: "Excesso de Velocidade" },
            { value: "direcao_perigosa", label: "Direção Perigosa" },
            { value: "uso_celular", label: "Uso de Celular" },
            { value: "veiculo_mal_conservado", label: "Veículo Mal Conservado" },
            { value: "desrespeito_sinalizacao", label: "Desrespeito à Sinalização" },
            { value: "embriaguez", label: "Embriaguez" },
            { value: "estacionamento_irregular", label: "Estacionamento Irregular" },
            { value: "poluicao_sonora", label: "Poluição Sonora" },
            { value: "poluicao_ambiental", label: "Poluição Ambiental" },
            { value: "outros", label: "Outros" },
          ],
          filterValue: filters?.complaint_type || "all",
          onFilterChange: (value: any) => onFilterChange("complaint_type", value === "all" ? "" : value),
        },
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }: any) => {
          const desc = row.getValue("description") as string;
          return <span className="line-clamp-2 max-w-md">{desc}</span>;
        },
      },
      {
        accessorKey: "occurrence_date",
        header: "Data Ocorrência",
        cell: ({ row }: any) => {
          const date = row.getValue("occurrence_date");
          return date ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR }) : "-";
        },
      },
      {
        accessorKey: "occurrence_location",
        header: "Local",
        cell: ({ row }: any) => {
          const location = row.getValue("occurrence_location") as string;
          return location || "-";
        },
      },
      {
        accessorKey: "complainant_name",
        header: "Denunciante",
        cell: ({ row }: any) => {
          const isAnonymous = row.original.is_anonymous;
          const name = row.getValue("complainant_name") as string;
          return isAnonymous || !name ? "Anônimo" : name;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          showFilterIcon: true,
          filterType: "select",
          filterOptions: [
            { value: "all", label: "Todos" },
            { value: "proposto", label: "Proposto" },
            { value: "em_analise", label: "Em Análise" },
            { value: "concluido", label: "Concluído" },
          ],
          filterValue: filters?.status || "all",
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
    ],
    [filters, onFilterChange]
  );

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <DataTable
        columns={columns}
        data={complaints}
        title="Lista de Denúncias"
        totalCount={totalCount}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        initialFilters={[]}
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
