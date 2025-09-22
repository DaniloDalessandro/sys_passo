"use client"

import { useState } from "react"
import { ConductorDataTable } from "@/components/conductors/ConductorDataTable"
import { ConductorStats } from "@/components/conductors/ConductorStats"
import { ConductorDialog } from "@/components/conductors/ConductorDialog"
import { ConductorDetailDialog } from "@/components/conductors/ConductorDetailDialog"
import { useConductors, ConductorFormData, Conductor } from "@/hooks/useConductors"
import { toast } from "sonner"

export default function ConductorsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null)

  const {
    conductors,
    isLoading,
    createConductor,
    updateConductor,
    deleteConductor,
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

  const handleDelete = async (id: number) => {
    try {
      await deleteConductor(id)
      toast.success("Condutor excluído com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir condutor")
    }
  }

  const handleNewConductor = () => {
    setEditingConductor(null)
    setIsDialogOpen(true)
  }

  const handleViewDetails = (conductor: Conductor) => {
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
      </div>
    </div>
  )
}