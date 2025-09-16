"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle, Mail, Phone, Users, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleDelete = (conductor: Conductor) => {
    if (confirm("Tem certeza que deseja excluir este condutor?")) {
      onDelete(conductor.id);
    }
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
          const genderMap = { M: "Masculino", F: "Feminino", O: "Outro" };
          return (
            <div>
              <div className="font-medium">{conductor.name}</div>
              <div className="text-sm text-gray-500 space-y-1">
                {conductor.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {conductor.email}
                  </div>
                )}
                {conductor.gender && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {genderMap[conductor.gender]}
                  </div>
                )}
              </div>
            </div>
          );
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
            <div className="text-sm space-y-1">
              {conductor.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {conductor.phone}
                </div>
              )}
              {conductor.whatsapp && (
                <div className="flex items-center gap-1 text-green-600">
                  <Phone className="h-3 w-3" />
                  {conductor.whatsapp} (WhatsApp)
                </div>
              )}
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
          return (
            <div className="flex items-center gap-1 text-sm">
              <Globe className="h-3 w-3" />
              {conductor.nationality || "N/A"}
            </div>
          );
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
              <Badge variant={getCategoryBadgeVariant(conductor.license_category)}>
                {conductor.license_category}
              </Badge>
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {format(new Date(conductor.license_expiry_date), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
                {conductor.is_license_expired && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Vencida
                  </Badge>
                )}
                {!conductor.is_license_expired && isLicenseExpiringSoon(conductor.license_expiry_date) && (
                  <Badge variant="secondary" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Vence em breve
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {conductor.photo && (
                  <Badge variant="outline" className="text-xs">
                    Foto
                  </Badge>
                )}
                {conductor.cnh_digital && (
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    CNH Digital
                  </Badge>
                )}
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
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
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
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }: any) => {
          const conductor = row.original as Conductor;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                {onViewDetails && (
                  <DropdownMenuItem
                    onClick={() => onViewDetails(conductor)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onEdit(conductor)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(conductor)}
                  className="cursor-pointer text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, onViewDetails]
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
        onEdit={(conductor: Conductor) => onEdit(conductor)}
        onDelete={(conductor: Conductor) => onDelete(conductor.id)}
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