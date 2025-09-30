"use client";

import VehicleForm from "../forms/VehicleForm";
import { Vehicle } from "@/hooks/useVehicles";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function VehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
  isLoading = false,
}: VehicleDialogProps) {
  const handleSubmit = async (data: any) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <VehicleForm
      open={open}
      handleClose={() => onOpenChange(false)}
      initialData={vehicle}
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
    />
  );
}