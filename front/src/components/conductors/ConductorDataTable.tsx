"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable } from "@/components/ui/data-table";
import { Conductor } from "@/hooks/useConductors";

interface ConductorDataTableProps {
  conductors: Conductor[];
  onAdd: () => void;
  onEdit: (conductor: Conductor) => void;
  onDelete: (conductor: Conductor) => void;
  onViewDetails?: (conductor: Conductor) => void;
  isLoading?: boolean;
}

const STORAGE_KEY = "conductor-table-column-visibility";

// Default visible columns - only 5 main columns
const DEFAULT_VISIBLE_COLUMNS = [
  "name",
  "cpf",
  "license_number",
  "license_category",
  "is_active"
];

export function ConductorDataTable({
  conductors,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
}: ConductorDataTableProps) {
  // Status filter state - empty means show only active by default
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Column visibility state with localStorage persistence
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved column visibility", e);
        }
      }
    }
    return {};
  });

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(columnVisibility).length > 0) {
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

  // Filter conductors based on status
  const filteredConductors = useMemo(() => {
    if (statusFilter === "Todos") {
      return conductors;
    }
    if (statusFilter === "Inativo") {
      return conductors.filter((conductor) => !conductor.is_active);
    }
    // Default: show only active conductors (when statusFilter is empty)
    return conductors.filter((conductor) => conductor.is_active);
  }, [conductors, statusFilter]);


  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.name;
        },
      },
      {
        accessorKey: "cpf",
        header: "CPF",
        meta: {
          showFilterIcon: true,
        },
      },
      {
        accessorKey: "license_number",
        header: "CNH",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.license_number;
        },
      },
      {
        accessorKey: "license_category",
        header: "Categoria",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.license_category;
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        meta: {
          showFilterIcon: true,
          filterType: "select",
          filterOptions: [
            { value: "Todos", label: "Todos" },
            { value: "Inativo", label: "Inativo" },
          ],
          filterValue: statusFilter,
          onFilterChange: setStatusFilter,
        },
        cell: ({ row }: any) => {
          const isActive = row.getValue("is_active") as boolean;
          return isActive ? "Ativo" : "Inativo";
        },
      },
      // Optional columns (hidden by default)
      {
        accessorKey: "phone",
        header: "Telefone",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.phone || "-";
        },
      },
      {
        accessorKey: "whatsapp",
        header: "WhatsApp",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.whatsapp || "-";
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.email || "-";
        },
      },
      {
        accessorKey: "address",
        header: "Endereço",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.address || "-";
        },
      },
      {
        accessorKey: "nationality",
        header: "Nacionalidade",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.nationality || "N/A";
        },
      },
      {
        accessorKey: "gender_display",
        header: "Sexo",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.gender_display || "N/A";
        },
      },
      {
        accessorKey: "birth_date",
        header: "Data de Nascimento",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return conductor.birth_date
            ? format(new Date(conductor.birth_date), "dd/MM/yyyy", { locale: ptBR })
            : "N/A";
        },
      },
      {
        accessorKey: "license_expiry_date",
        header: "Validade CNH",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          const formatted = format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", {
            locale: ptBR,
          });
          if (conductor.is_license_expired) {
            return `${formatted} (Vencida)`;
          }
          if (isLicenseExpiringSoon(conductor.license_expiry_date)) {
            return `${formatted} (Vence em breve)`;
          }
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
          return (
            <div className="text-sm">
              {docs.length > 0 ? docs.join(", ") : "-"}
            </div>
          );
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
    [onViewDetails, statusFilter, setStatusFilter]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando condutores...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <DataTable
        columns={columns}
        data={filteredConductors}
        title="Lista de Condutores"
        pageSize={10}
        pageIndex={0}
        totalCount={filteredConductors.length}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onFilterChange={() => {}}
        onSortingChange={() => {}}
        readOnly={false}
        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />
    </div>
  );
}