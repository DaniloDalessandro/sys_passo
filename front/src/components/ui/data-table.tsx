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
  SortingState,
} from "@tanstack/react-table";

// Extend ColumnMeta to include custom filter properties
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    showFilterIcon?: boolean;
    filterType?: 'text' | 'select';
    filterOptions?: Array<{ value: string; label: string }>;
    filterValue?: string;
    onFilterChange?: (value: string) => void;
  }
}
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

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface DataTableProps<TData extends { id?: any }> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title: string;
  subtitle?: string;
  pageSize?: number;
  pageIndex?: number;
  totalCount?: number;
  initialFilters?: { id: string; value: any }[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (columnId: string, value: any) => void;
  onAdd?: () => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onViewDetails?: (row: TData) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  defaultVisibleColumns?: string[] | null;
  columnVisibility?: VisibilityState | null;
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>> | null;
}

export function DataTable<TData extends { id?: any }>({
  columns,
  data,
  title,
  subtitle,
  pageSize = 10,
  pageIndex = 0,
  totalCount = 0,
  initialFilters,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  readOnly = false,
  isLoading = false,
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
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

  // Apply initial filters when component mounts
  React.useEffect(() => {
    if (initialFilters && initialFilters.length > 0) {
      initialFilters.forEach(filter => {
        const column = table.getColumn(filter.id);
        if (column) {
          column.setFilterValue(filter.value);
        }
      });
    }
  }, [initialFilters]);

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
    // Limpar filtros de texto
    table.getAllColumns().forEach((col) => {
      col.setFilterValue("");
    });

    // Restaurar filtros padrão (select filters)
    table.getAllColumns().forEach((col) => {
      if (col.columnDef.meta?.filterType === "select") {
        const defaultFilter = initialFilters?.find(f => f.id === col.id);
        const defaultValue = defaultFilter?.value || "";

        if (col.columnDef.meta?.onFilterChange) {
          col.columnDef.meta.onFilterChange(defaultValue);
        }
      }
    });

    setOpenFilterId(null);

    // Notificar o componente pai sobre a limpeza
    if (onFilterChange) {
      table.getAllColumns().forEach((col) => {
        const defaultFilter = initialFilters?.find(f => f.id === col.id);
        if (defaultFilter) {
          onFilterChange(col.id, defaultFilter.value);
        } else if (col.getFilterValue()) {
          onFilterChange(col.id, "");
        }
      });
    }
  };

  const activeFilters = table.getState().columnFilters.filter(
    (f) => f.value !== undefined && f.value !== ""
  );

  // Determinar quais são os filtros padrão
  const defaultFilterIds = (initialFilters || []).map(f => f.id);
  const isDefaultFilter = (filterId: string, value: any) => {
    const defaultFilter = initialFilters?.find(f => f.id === filterId);
    if (!defaultFilter) return false;
    // Comparar valores (considerar que podem ser strings ou outros tipos)
    return String(defaultFilter.value).toLowerCase() === String(value).toLowerCase();
  };

  // Filtrar os badges exibíveis
  const displayableFilters = activeFilters.filter(
    (f) => {
      const value = String(f.value || '').toLowerCase();
      // Não exibir se for filtro padrão ou se o valor for "todos"/"all"
      return !isDefaultFilter(f.id, f.value) && value !== 'todos' && value !== 'all' && value !== '';
    }
  );

  // Verificar se há filtros exibíveis
  const hasDisplayableFilters = displayableFilters.length > 0 ||
    table.getAllColumns().some((col) => {
      const filterValue = col.columnDef.meta?.filterValue;
      if (!filterValue || filterValue === '') return false;
      const value = String(filterValue).toLowerCase();
      return !isDefaultFilter(col.id, filterValue) && value !== 'todos' && value !== 'all';
    });

  return (
    <Card className="shadow-lg pb-0.5 h-full flex flex-col w-full overflow-hidden">
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
        {hasDisplayableFilters && (
          <div className="flex flex-wrap gap-2 mb-3">
            {displayableFilters.map((filter) => {
              const column = table.getColumn(filter.id);
              return (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="font-medium">{column?.columnDef.header}:</span>{" "}
                  <span>{filter.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearFilter(filter.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
            {table.getAllColumns().map((column) => {
              const filterValue = column.columnDef.meta?.filterValue;
              if (column.columnDef.meta?.filterType === "select" && filterValue && filterValue !== "") {
                const value = String(filterValue).toLowerCase();
                // Não exibir badge se for filtro padrão ou "todos"/"all"
                if (isDefaultFilter(column.id, filterValue) || value === 'todos' || value === 'all') {
                  return null;
                }
                return (
                  <Badge
                    key={column.id}
                    variant="outline"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span className="font-medium">{column.columnDef.header}:</span>{" "}
                    <span>{filterValue}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (column.columnDef.meta?.onFilterChange) {
                          column.columnDef.meta.onFilterChange("");
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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

        <div className="border shadow-sm rounded-lg overflow-hidden flex-1 flex flex-col w-full">
          <div className="flex-1 overflow-auto w-full">
            <Table className="w-full">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
