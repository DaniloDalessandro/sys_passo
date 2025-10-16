"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable, PaginationState } from "@/components/ui/data-table";
import { Conductor } from "@/hooks/useConductors";

interface ConductorDataTableProps {
  conductors: Conductor[];
  totalCount: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onAdd: () => void;
  onEdit: (conductor: Conductor) => void;
  onDelete: (conductor: Conductor) => void;
  onViewDetails?: (conductor: Conductor) => void;
  isLoading?: boolean;
}

const STORAGE_KEY = "conductor-table-column-visibility";

const DEFAULT_VISIBLE_COLUMNS = [
  "name",
  "cpf",
  "phone",
  "license_number",
  "license_category",
  "is_active"
];

export function ConductorDataTable({
  conductors,
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
}: ConductorDataTableProps) {

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }

    // Se não há nada salvo, usar DEFAULT_VISIBLE_COLUMNS
    // Todas as colunas disponíveis
    const allColumns = [
      "name", "cpf", "license_number", "license_category", "phone",
      "whatsapp", "email", "address", "nationality", "gender_display",
      "birth_date", "license_expiry_date", "documents",
      "created_at", "updated_at", "is_active"
    ];

    // Criar objeto de visibilidade: true apenas para as colunas em DEFAULT_VISIBLE_COLUMNS
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

  const isLicenseExpiringSoon = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Nome", meta: { showFilterIcon: true } },
      { accessorKey: "cpf", header: "CPF", meta: { showFilterIcon: true } },
      { accessorKey: "license_number", header: "CNH", meta: { showFilterIcon: true } },
      { accessorKey: "license_category", header: "Categoria", meta: { showFilterIcon: true } },
      { accessorKey: "phone", header: "Telefone", meta: { showFilterIcon: true } },
      { accessorKey: "whatsapp", header: "WhatsApp", meta: { showFilterIcon: true } },
      { accessorKey: "email", header: "Email", meta: { showFilterIcon: true } },
      { accessorKey: "address", header: "Endereço", meta: { showFilterIcon: true } },
      { accessorKey: "nationality", header: "Nacionalidade", meta: { showFilterIcon: true } },
      { accessorKey: "gender_display", header: "Sexo", meta: { showFilterIcon: true } },
      {
        accessorKey: "birth_date",
        header: "Data de Nascimento",
        meta: { showFilterIcon: true },
        cell: ({ row }: any) => {
          const date = row.getValue("birth_date") as string;
          return date ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR }) : "N/A";
        },
      },
      {
        accessorKey: "license_expiry_date",
        header: "Validade CNH",
        meta: { showFilterIcon: true },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          const formatted = format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", { locale: ptBR });
          if (conductor.is_license_expired) return `${formatted} (Vencida)`;
          if (isLicenseExpiringSoon(conductor.license_expiry_date)) return `${formatted} (Vence em breve)`;
          return formatted;
        },
      },
      {
        accessorKey: "documents",
        header: "Documentos",
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          const docs = [];
          if (conductor.photo) docs.push("Foto");
          if (conductor.cnh_digital) docs.push("CNH Digital");
          return docs.length > 0 ? docs.join(", ") : "-";
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
        accessorKey: "is_active",
        header: "Status",
        meta: {
          showFilterIcon: true,
          filterType: "select",
          filterOptions: [
            { value: "true", label: "Ativo" },
            { value: "false", label: "Inativo" },
          ],
          filterValue: filters?.is_active || "",
          onFilterChange: (value: any) => onFilterChange({ ...filters, is_active: value }),
        },
        cell: ({ row }: any) => (row.getValue("is_active") ? "Ativo" : "Inativo"),
      },
    ],
    [filters, onFilterChange]
  );

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <DataTable
        columns={columns}
        data={conductors}
        title="Lista de Condutores"
        totalCount={totalCount}
        pageSize={pagination.pageSize}
        pageIndex={pagination.pageIndex}
        initialFilters={[
          { id: 'is_active', value: filters?.is_active || 'true' }
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
      />
    </div>
  );
}
