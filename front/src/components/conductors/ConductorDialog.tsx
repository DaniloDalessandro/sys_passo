"use client"

import { useState } from "react"
import ConductorForm from "../forms/ConductorForm"
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
    <ConductorForm
      open={open}
      handleClose={() => onOpenChange(false)}
      initialData={conductor ? formatInitialData(conductor) : null}
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
    />
  )
}