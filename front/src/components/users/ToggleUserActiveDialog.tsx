"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SystemUser } from "@/hooks/useUsers"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SystemUser | null
  onConfirm: () => void
  isLoading?: boolean
}

export function ToggleUserActiveDialog({ open, onOpenChange, user, onConfirm, isLoading = false }: Props) {
  if (!user) return null
  const isDeactivating = user.is_active

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isDeactivating ? 'Desativar Usuário' : 'Ativar Usuário'}</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja {isDeactivating ? 'desativar' : 'ativar'} o usuário{' '}
            <strong>{user.username}</strong>?
            {isDeactivating && (
              <>
                <br /><br />O usuário não conseguirá mais acessar o sistema.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm() }}
            disabled={isLoading}
            className={isDeactivating ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isLoading ? "Aguarde..." : isDeactivating ? "Desativar" : "Ativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
