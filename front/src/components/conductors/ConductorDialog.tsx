"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
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
      whatsapp: conductor.whatsapp || "",
      birth_date: conductor.birth_date ? new Date(conductor.birth_date) : undefined,
      gender: conductor.gender || "M",
      nationality: conductor.nationality || "Brasileira",
      license_number: conductor.license_number,
      license_category: conductor.license_category,
      license_expiry_date: new Date(conductor.license_expiry_date),
      address: conductor.address || "",
      is_active: conductor.is_active,
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] p-0 flex flex-col overflow-hidden">
        <div className="p-3 sm:p-4 flex-shrink-0 border-b border-gray-100">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditing ? "Editar Condutor" : "Novo Condutor"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {isEditing
                ? "Atualize os dados do condutor abaixo"
                : "Preencha os dados para cadastrar um novo condutor"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            <ConductorForm
              onSubmit={handleSubmit}
              initialData={conductor ? formatInitialData(conductor) : undefined}
              isLoading={isLoading}
              submitButtonText={isEditing ? "Atualizar Condutor" : "Cadastrar Condutor"}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}