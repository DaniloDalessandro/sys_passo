"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Conductor } from "@/hooks/useConductors";

interface DeactivateConductorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor: Conductor | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeactivateConductorDialog({
  open,
  onOpenChange,
  conductor,
  onConfirm,
  isLoading = false,
}: DeactivateConductorDialogProps) {
  if (!conductor) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Inativar Condutor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja inativar o condutor <strong>{conductor.name}</strong>?
            <br />
            <br />
            O condutor será marcado como inativo e não aparecerá na listagem padrão.
            Você poderá reativá-lo posteriormente através do filtro de status.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Inativando..." : "Inativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
