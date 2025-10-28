"use client"

import { useState, useEffect, useCallback } from "react"
import {
  VehicleDataTable,
  VehicleStats,
  VehicleDialog,
  VehicleDetailDialog,
} from "@/components/vehicles"
import { useVehicles, VehicleFormData, Vehicle } from "@/hooks/useVehicles"
import { toast } from "sonner"
import { SortingState } from "@tanstack/react-table"

export default function VehiclesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // State for server-side pagination and filtering
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [filters, setFilters] = useState<Record<string, any>>({ status: 'ativo' });
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    vehicles,
    totalCount,
    stats,
    isLoading,
    fetchVehicles,
    fetchStats,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
  } = useVehicles()

  // Fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch data when pagination or filters change
  useEffect(() => {
    const ordering = sorting.map(s => (s.desc ? "-" : "") + s.id).join(",");
    const fetchParams = {
      page: pagination.pageIndex + 1, // API is 1-based, table is 0-based
      pageSize: pagination.pageSize,
      filters: filters,
      ordering: ordering,
    };
    fetchVehicles(fetchParams);
  }, [pagination, filters, sorting, fetchVehicles]);

  const handleRefreshData = useCallback(() => {
    const ordering = sorting.map(s => (s.desc ? "-" : "") + s.id).join(",");
    const fetchParams = {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      filters: filters,
      ordering: ordering,
    };
    fetchVehicles(fetchParams);
    fetchStats(); // Atualiza estatísticas também
  }, [pagination, filters, sorting, fetchVehicles, fetchStats]);

  const handleSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true)
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, data)
        toast.success("Veículo atualizado com sucesso!")
      } else {
        await createVehicle(data)
        toast.success("Veículo cadastrado com sucesso!")
      }
      setIsDialogOpen(false)
      setEditingVehicle(null)
      handleRefreshData() // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar veículo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (vehicle: Vehicle) => {
    try {
      const fullVehicle = await getVehicle(vehicle.id)
      setEditingVehicle(fullVehicle)
      setIsDialogOpen(true)
    } catch (error) {
      toast.error("Não foi possível carregar os dados do veículo.", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    }
  }

  const handleDelete = async (vehicle: Vehicle) => {
    try {
      await deleteVehicle(vehicle.id)
      toast.success("Veículo excluído com sucesso!")
      handleRefreshData() // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir veículo")
    }
  }

  const handleNewVehicle = () => {
    setEditingVehicle(null)
    setIsDialogOpen(true)
  }

  const handleViewDetails = (vehicle: Vehicle) => {
    if (!vehicle || !vehicle.id) {
      toast.error('Erro: ID do veículo não encontrado');
      return;
    }
    const url = `/vehicles/${vehicle.id}/details`;
    window.open(url, '_blank');
  }

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  }

  return (
    <div className="flex flex-col h-full p-4 pt-0 w-full overflow-hidden">
      <div className="flex flex-col gap-6 w-full overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
            <p className="text-gray-500 mt-1">Gerenciar frota de veículos</p>
          </div>
        </div>

        <VehicleStats stats={stats} />

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <VehicleDataTable
            vehicles={vehicles}
            totalCount={totalCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            sorting={sorting}
            onSortingChange={setSorting}
            onAdd={handleNewVehicle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </div>

        <VehicleDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          vehicle={editingVehicle}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />

        <VehicleDetailDialog
          vehicle={selectedVehicle}
          open={isDetailDialogOpen && selectedVehicle !== null}
          onOpenChange={(open) => {
            setIsDetailDialogOpen(open);
            if (!open) {
              setSelectedVehicle(null);
            }
          }}
          onEdit={handleEdit}
        />
      </div>
    </div>
  )
}