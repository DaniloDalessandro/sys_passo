"use client"

import { useState } from "react"
import {
  ConductorDataTable,
  ConductorStats,
  ConductorDialog,
  ConductorDetailDialog,
  DeactivateConductorDialog,
} from "@/components/conductors"
import { useConductors, ConductorFormData, Conductor } from "@/hooks/useConductors"
import { toast } from "sonner"

export default function ConductorsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [conductorToDeactivate, setConductorToDeactivate] = useState<Conductor | null>(null)

  const {
    conductors,
    isLoading,
    createConductor,
    updateConductor,
    deleteConductor,
    fetchConductors,
  } = useConductors()

  const handleSubmit = async (data: ConductorFormData) => {
    setIsSubmitting(true)
    try {
      if (editingConductor) {
        await updateConductor(editingConductor.id, data)
        toast.success("Condutor atualizado com sucesso!")
      } else {
        await createConductor(data)
        toast.success("Condutor cadastrado com sucesso!")
      }
      setIsDialogOpen(false)
      setEditingConductor(null)
      // Refresh the conductors list to ensure data is up to date
      await fetchConductors()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar condutor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (conductor: Conductor) => {
    setEditingConductor(conductor)
    setIsDialogOpen(true)
  }

  const handleDelete = (conductor: Conductor) => {
    setConductorToDeactivate(conductor)
    setIsDeactivateDialogOpen(true)
  }

  const handleConfirmDeactivate = async () => {
    if (!conductorToDeactivate) return

    setIsSubmitting(true)
    try {
      await updateConductor(conductorToDeactivate.id, { is_active: false })
      toast.success("Condutor inativado com sucesso!")
      setIsDeactivateDialogOpen(false)
      setConductorToDeactivate(null)
      // Refresh the conductors list to ensure data is up to date
      await fetchConductors()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao inativar condutor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewConductor = () => {
    setEditingConductor(null)
    setIsDialogOpen(true)
  }

  const handleViewDetails = (conductor: Conductor) => {
    if (!conductor || !conductor.id) {
      toast.error('Erro: ID do condutor não encontrado');
      return;
    }

    // Open in new tab
    const url = `/conductors/${conductor.id}/details`;
    window.open(url, '_blank');
  }


  return (
    <div className="flex flex-col h-full p-4 pt-0">
      <div className="flex flex-col gap-6">
        {/* Header - Removed "Novo Condutor" button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Condutores</h1>
            <p className="text-gray-500 mt-1">Gerenciar condutores do sistema</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <ConductorStats conductors={conductors} />

        {/* Data Table with Fixed Height and Scroll */}
        <div className="flex-1 min-h-0">
          <ConductorDataTable
            conductors={conductors}
            onAdd={handleNewConductor}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </div>

        {/* Dialog for Create/Edit */}
        <ConductorDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          conductor={editingConductor}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />

        {/* Dialog for View Details */}
        <ConductorDetailDialog
          conductor={selectedConductor}
          open={isDetailDialogOpen && selectedConductor !== null}
          onOpenChange={(open) => {
            setIsDetailDialogOpen(open);
            if (!open) {
              // Clear selected conductor when dialog closes
              setSelectedConductor(null);
            }
          }}
          onEdit={handleEdit}
        />

        {/* Dialog for Deactivate Confirmation */}
        <DeactivateConductorDialog
          open={isDeactivateDialogOpen}
          onOpenChange={setIsDeactivateDialogOpen}
          conductor={conductorToDeactivate}
          onConfirm={handleConfirmDeactivate}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}