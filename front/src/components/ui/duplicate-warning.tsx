"use client";

import React from "react";
import { AlertTriangle, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { DuplicateWarning } from "@/hooks/useDuplicateWarnings";

interface DuplicateWarningProps {
  warning: DuplicateWarning;
  className?: string;
}

export function DuplicateWarningDisplay({ warning, className }: DuplicateWarningProps) {
  if (!warning.exists && !warning.isLoading) {
    return null;
  }

  if (warning.isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-gray-500", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Verificando...</span>
      </div>
    );
  }

  if (warning.exists) {
    return (
      <Alert variant="warning" className={cn("border-amber-200 bg-amber-50", className)}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700">
          <div className="space-y-2">
            <div className="font-medium">{warning.message}</div>
            {warning.duplicateConductor && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3 w-3" />
                <span className="font-medium">
                  {warning.duplicateConductor.name}
                </span>
                <Badge
                  variant={warning.duplicateConductor.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {warning.duplicateConductor.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

interface DuplicateWarningInlineProps {
  warning: DuplicateWarning;
  className?: string;
}

export function DuplicateWarningInline({ warning, className }: DuplicateWarningInlineProps) {
  if (!warning.exists && !warning.isLoading) {
    return null;
  }

  if (warning.isLoading) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-gray-500 mt-1", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Verificando...</span>
      </div>
    );
  }

  if (warning.exists) {
    return (
      <div className={cn("flex items-start gap-1 text-xs text-amber-700 mt-1", className)}>
        <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <div className="font-medium">{warning.message}</div>
          {warning.duplicateConductor && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <User className="h-3 w-3" />
              <span>{warning.duplicateConductor.name}</span>
              {!warning.duplicateConductor.is_active && (
                <span className="text-gray-500">(Inativo)</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}