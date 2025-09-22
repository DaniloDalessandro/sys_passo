"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable } from "@/components/ui/data-table";
import { Conductor } from "@/hooks/useConductors";

interface ConductorDataTableProps {
  conductors: Conductor[];
  onAdd: () => void;
  onEdit: (conductor: Conductor) => void;
  onDelete: (id: number) => void;
  onViewDetails?: (conductor: Conductor) => void;
  isLoading?: boolean;
}

export function ConductorDataTable({
  conductors,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
}: ConductorDataTableProps) {
  const isLicenseExpiringSoon = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };


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
        accessorKey: "phone",
        header: "Contato",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return (
            <div className="space-y-1">
              {conductor.phone && <div>{conductor.phone}</div>}
              {conductor.whatsapp && <div>{conductor.whatsapp} (WhatsApp)</div>}
              {!conductor.phone && !conductor.whatsapp && "-"}
            </div>
          );
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
        accessorKey: "license_category",
        header: "Categoria CNH",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return (
            <div className="space-y-1">
              <div>{conductor.license_category}</div>
              <div className="text-xs text-gray-500">
                {conductor.license_number}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "license_expiry_date",
        header: "Documentos",
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;
          return (
            <div className="space-y-1">
              <div>
                {format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
                {conductor.is_license_expired && " (Vencida)"}
                {!conductor.is_license_expired && isLicenseExpiringSoon(conductor.license_expiry_date) && " (Vence em breve)"}
              </div>
              <div className="text-xs text-gray-500">
                {conductor.photo && "Foto "}
                {conductor.cnh_digital && "CNH Digital"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        meta: {
          showFilterIcon: true,
        },
        cell: ({ row }: any) => {
          const isActive = row.getValue("is_active") as boolean;
          return isActive ? "Ativo" : "Inativo";
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
        <span className="ml-2">Carregando condutores...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <DataTable
        columns={columns}
        data={conductors}
        title="Lista de Condutores"
        pageSize={10}
        pageIndex={0}
        totalCount={conductors.length}
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