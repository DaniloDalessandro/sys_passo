"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { DuplicateWarning } from "@/hooks/useDuplicateWarnings";

interface DuplicateWarningInlineProps {
  warning: DuplicateWarning;
}

export function DuplicateWarningInline({ warning }: DuplicateWarningInlineProps) {
  if (warning.isLoading) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Verificando...</span>
      </div>
    );
  }

  if (!warning.exists) {
    return null;
  }

  return (
    <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="font-medium">{warning.message || "Registro duplicado encontrado"}</span>
        {warning.duplicateConductor && (
          <span className="text-amber-500 mt-0.5">
            Condutor: {warning.duplicateConductor.name}
            {!warning.duplicateConductor.is_active && " (Inativo)"}
          </span>
        )}
      </div>
    </div>
  );
}
