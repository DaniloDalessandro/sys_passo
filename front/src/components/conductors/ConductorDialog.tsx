"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConductorForm } from "./ConductorForm"
import { Conductor } from "./ConductorList"

interface ConductorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conductor?: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function ConductorDialog({
  open,
  onOpenChange,
  conductor,
  onSubmit,
  isLoading = false
}: ConductorDialogProps) {
  const isEditing = !!conductor

  const handleSubmit = async (data: any) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  const formatInitialData = (conductor: any) => {
    return {
      name: conductor.name,
      cpf: conductor.cpf,
      email: conductor.email,
      phone: conductor.phone || "",
      birth_date: conductor.birth_date ? new Date(conductor.birth_date) : undefined,
      license_number: conductor.license_number,
      license_category: conductor.license_category,
      license_expiry_date: new Date(conductor.license_expiry_date),
      address: conductor.address || "",
      is_active: conductor.is_active,
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Condutor" : "Novo Condutor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do condutor abaixo"
              : "Preencha os dados para cadastrar um novo condutor"}
          </DialogDescription>
        </DialogHeader>

        <ConductorForm
          onSubmit={handleSubmit}
          initialData={conductor ? formatInitialData(conductor) : undefined}
          isLoading={isLoading}
          submitButtonText={isEditing ? "Atualizar Condutor" : "Cadastrar Condutor"}
        />
      </DialogContent>
    </Dialog>
  )
}