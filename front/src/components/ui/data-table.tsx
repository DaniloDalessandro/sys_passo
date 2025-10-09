"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  getFilteredRowModel,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  Filter,
  X,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title: string;
  subtitle?: string;
  pageSize?: number;
  pageIndex?: number;
  totalCount?: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onAdd?: () => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onViewDetails?: (row: TData) => void;
  onFilterChange?: (columnId: string, value: string) => void;
  onSortingChange?: (sorting: any[]) => void;
  readOnly?: boolean;
  defaultVisibleColumns?: string[] | null;
  columnVisibility?: VisibilityState | null;
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>> | null;
}

export function DataTable<TData>({
  columns,
  data,
  title,
  subtitle,
  pageSize = 10,
  pageIndex = 0,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onFilterChange,
  onSortingChange,
  readOnly = false,
  defaultVisibleColumns = null,
  columnVisibility: externalColumnVisibility = null,
  onColumnVisibilityChange: externalOnColumnVisibilityChange = null,
}: DataTableProps<TData>) {
  // Initialize column visibility with audit fields hidden by default
  const getInitialColumnVisibility = React.useCallback(() => {
    // If parent provides default visible columns, use those
    if (defaultVisibleColumns) {
      const initialVisibility = {};
      columns.forEach(column => {
        const columnId = column.accessorKey || column.id;
        // Only show columns that are in the defaultVisibleColumns array
        initialVisibility[columnId] = defaultVisibleColumns.includes(columnId);
      });
      return initialVisibility;
    }

    // Otherwise, use the legacy system (hide audit fields by default)
    const hiddenByDefaultFields = [
      // Audit fields
      'created_at', 'criado_em', 'createdAt',
      'created_by', 'criado_por', 'createdBy',
      'updated_at', 'atualizado_em', 'updatedAt',
      'updated_by', 'atualizado_por', 'updatedBy',
      // Budget Lines secondary fields
      'management_center.name',
      'requesting_center.name',
      'expense_type',
      'contract_type',
      'probable_procurement_type',
      'main_fiscal.full_name',
      'secondary_fiscal.full_name',
      'process_status',
      // Optional fields that should be hidden by default
      'phone', 'telefone'
    ];

    const initialVisibility = {};
    columns.forEach(column => {
      const columnId = column.accessorKey || column.id;
      const headerText = (column.header || '').toString().toLowerCase();

      // Check if this field should be hidden by default
      const shouldHide = hiddenByDefaultFields.some(field =>
        columnId === field ||
        headerText.includes('criado') ||
        headerText.includes('atualizado') ||
        headerText.includes('created') ||
        headerText.includes('updated') ||
        headerText.includes('telefone')
      );

      if (shouldHide) {
        initialVisibility[columnId] = false;
      }
    });

    return initialVisibility;
  }, [columns, defaultVisibleColumns]);

  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>(() => getInitialColumnVisibility());
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);
  const [sorting, setSorting] = React.useState<any[]>([]);
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);
  const [openFilterId, setOpenFilterId] = React.useState<string | null>(null);

  // Use external column visibility if provided, otherwise use internal state
  const columnVisibility: VisibilityState = externalColumnVisibility !== null ? externalColumnVisibility : internalColumnVisibility;
  const setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>> = externalOnColumnVisibilityChange !== null ? externalOnColumnVisibilityChange : setInternalColumnVisibility;

  // Update column visibility when columns change (only for internal state)
  React.useEffect(() => {
    if (externalColumnVisibility === null) {
      setInternalColumnVisibility(prev => ({ ...getInitialColumnVisibility(), ...prev }));
    }
  }, [getInitialColumnVisibility, externalColumnVisibility]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
      columnFilters,
      columnVisibility,
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater(table.getState()) : updater;
      if (onPageChange) onPageChange(newState.pageIndex);
      if (onPageSizeChange) onPageSizeChange(newState.pageSize);
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      // Call parent callback to trigger API call with new sorting
      if (onSortingChange) {
        onSortingChange(newSorting);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Filtragem, ordenação etc precisam ser refletidos na query backend
  // Para simplificação, agora a paginação já é controlada externamente

  const handleFilterChange = (columnId, value) => {
    table.getColumn(columnId)?.setFilterValue(value);
    // Call parent callback to trigger API call with filter
    if (onFilterChange) {
      onFilterChange(columnId, value);
    }
  };

  const clearFilter = (columnId) => {
    table.getColumn(columnId)?.setFilterValue("");
    setOpenFilterId(null);
    // Call parent callback to clear filter
    if (onFilterChange) {
      onFilterChange(columnId, "");
    }
  };

  const clearAllFilters = () => {
    table.getAllColumns().forEach((col) => {
      col.setFilterValue("");
      // Reset select filters to empty string (default state)
      if (col.columnDef.meta?.filterType === "select" && col.columnDef.meta?.onFilterChange) {
        col.columnDef.meta.onFilterChange("");
      }
    });
    setOpenFilterId(null);
    // Call parent callback to clear all filters
    if (onFilterChange) {
      table.getAllColumns().forEach((col) => {
        if (col.getFilterValue()) {
          onFilterChange(col.id, "");
        }
      });
    }
  };

  const activeFilters = table.getState().columnFilters.filter(
    (f) => f.value !== undefined && f.value !== ""
  );

  return (
    <Card className="shadow-lg pb-0.5 h-full flex flex-col">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
          <div>
            <h2 className="text-xl font-bold text-primary">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {onAdd && (
              <Plus
                className="h-6 w-6 cursor-pointer"
                onClick={onAdd}
                aria-label="Adicionar novo item"
                role="button"
              />
            )}
            {onViewDetails && selectedRow && (
              <Eye
                className="h-6 w-6 cursor-pointer"
                onClick={() => onViewDetails(selectedRow)}
                aria-label="Ver detalhes do item selecionado"
                role="button"
              />
            )}
            {!readOnly && selectedRow && (
              <>
                <Edit
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => onEdit(selectedRow)}
                  aria-label="Editar item"
                  role="button"
                />
                <Trash
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => onDelete(selectedRow)}
                  aria-label="Excluir item"
                  role="button"
                />
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Settings
                  className="h-6 w-6 cursor-pointer"
                  aria-label="Configurar colunas"
                  role="button"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
                  Colunas Visíveis
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onSelect={(e) => {
                          e.preventDefault();
                          column.toggleVisibility(!column.getIsVisible());
                        }}
                      >
                        {column.columnDef.header || column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </div>
                {defaultVisibleColumns && (
                  <>
                    <div className="border-t my-1" />
                    <div className="px-2 py-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          const defaultVisibility = {};
                          columns.forEach(column => {
                            const columnId = column.accessorKey || column.id;
                            defaultVisibility[columnId] = defaultVisibleColumns.includes(columnId);
                          });
                          setColumnVisibility(defaultVisibility);
                        }}
                      >
                        Resetar para Padrão
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* TAGS DE FILTROS */}
        {(activeFilters.length > 0 || table.getAllColumns().some((col) => col.columnDef.meta?.filterValue && col.columnDef.meta?.filterValue !== "Todos")) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {activeFilters.map((filter) => {
              const column = table.getColumn(filter.id);
              return (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <span className="font-medium">{column?.columnDef.header}:</span>{" "}
                  <span>{filter.value}</span>
                  <X
                    className="h-3 w-3 cursor-pointer ml-1"
                    onClick={() => clearFilter(filter.id)}
                  />
                </Badge>
              );
            })}
            {table.getAllColumns().map((column) => {
              const filterValue = column.columnDef.meta?.filterValue;
              // Debug log
              if (column.columnDef.meta?.filterType === "select") {
                console.log(`Column: ${column.id}, FilterValue: "${filterValue}", Type: ${typeof filterValue}`);
              }
              if (column.columnDef.meta?.filterType === "select" && filterValue && filterValue !== "") {
                return (
                  <Badge
                    key={column.id}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <span className="font-medium">{column.columnDef.header}:</span>{" "}
                    <span>{filterValue}</span>
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => {
                        if (column.columnDef.meta?.onFilterChange) {
                          column.columnDef.meta.onFilterChange("");
                        }
                      }}
                    />
                  </Badge>
                );
              }
              return null;
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2 text-sm text-red-500"
            >
              Limpar filtros
            </Button>
          </div>
        )}

        <div className="border shadow-sm rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const showFilterIcon =
                      header.column.columnDef.meta?.showFilterIcon;
                    const columnId = header.column.id;
                    const filterValue = header.column.getFilterValue();
                    const isFilterOpen = openFilterId === columnId;

                    return (
                      <TableHead key={header.id} className="font-semibold">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            {showFilterIcon && (
                              <div className="relative flex-shrink-0">
                                <Popover
                                  open={isFilterOpen}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setOpenFilterId(columnId);
                                    } else {
                                      setOpenFilterId(null);
                                    }
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenFilterId(isFilterOpen ? null : columnId);
                                      }}
                                    >
                                      <Filter
                                        className={`h-3.5 w-3.5 ${
                                          filterValue
                                            ? "text-primary"
                                            : "text-gray-400"
                                        }`}
                                      />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-60 p-3"
                                    align="start"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">
                                          Filtrar {header.column.columnDef.header}
                                        </h4>
                                        {filterValue && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2"
                                            onClick={() => clearFilter(columnId)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                      {header.column.columnDef.meta?.filterType === "select" ? (
                                        <Select
                                          value={header.column.columnDef.meta?.filterValue ?? ""}
                                          onValueChange={(value) => {
                                            if (header.column.columnDef.meta?.onFilterChange) {
                                              header.column.columnDef.meta.onFilterChange(value);
                                            }
                                            // Close the popover after selection
                                            setOpenFilterId(null);
                                          }}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {header.column.columnDef.meta?.filterOptions?.map((option: any) => (
                                              <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          placeholder={`Filtrar...`}
                                          value={filterValue ?? ""}
                                          onChange={(e) =>
                                            handleFilterChange(
                                              columnId,
                                              e.target.value
                                            )
                                          }
                                          autoFocus
                                        />
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                            <div
                              className="cursor-pointer select-none flex items-center flex-1 min-w-0"
                              onClick={() =>
                                header.column.getCanSort() &&
                                header.column.toggleSorting()
                              }
                            >
                              <span className="truncate">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                              {header.column.getCanSort() && (
                                <span className="ml-1 text-gray-400 flex-shrink-0">
                                  {{
                                    asc: "▲",
                                    desc: "▼",
                                  }[header.column.getIsSorted()] ?? "↕"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedRow?.id === row.original.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.id === row.original.id ? null : row.original
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const showFilterIcon = cell.column.columnDef.meta?.showFilterIcon;
                      return (
                        <TableCell key={cell.id} className="py-2">
                          <div className="flex items-center w-full">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              {showFilterIcon && (
                                <div className="w-7 flex-shrink-0"></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="truncate block">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* PAGINAÇÃO */}
        <div className="flex items-center justify-between space-x-2 py-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Página {pageIndex + 1} de {Math.ceil(totalCount / pageSize)} —{" "}
            {totalCount} registros
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(0)}
              disabled={pageIndex === 0}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pageIndex + 1)}
              disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(Math.ceil(totalCount / pageSize) - 1)}
              disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
            >
              {">>"}
            </Button>

            <select
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
