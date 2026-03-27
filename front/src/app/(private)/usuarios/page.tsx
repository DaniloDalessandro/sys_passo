"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/AuthContext"
import { useUsers, SystemUser, UserRole, CreateUserFormData } from "@/hooks/useUsers"
import { UserDataTable, CreateUserDialog, ToggleUserActiveDialog } from "@/components/users"
import { toast } from "sonner"
import { ShieldAlert } from "lucide-react"

export default function UsuariosPage() {
  const { user: currentUser, canAdmin } = useAuthContext()
  const router = useRouter()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<SystemUser | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState<{ search?: string; role?: string; is_active?: string }>({})

  const { users, totalCount, isLoading, fetchUsers, createUser, updateUser } = useUsers()

  useEffect(() => {
    if (!canAdmin) {
      router.replace("/dashboard")
    }
  }, [canAdmin, router])

  useEffect(() => {
    fetchUsers(filters)
  }, [filters, fetchUsers])

  const handleRoleChange = useCallback(async (userId: number, newRole: UserRole) => {
    try {
      await updateUser(userId, { role: newRole })
      toast.success("Papel atualizado com sucesso!")
      fetchUsers(filters)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar papel")
    }
  }, [updateUser, fetchUsers, filters])

  const handleToggleActive = useCallback((user: SystemUser) => {
    setTargetUser(user)
    setIsToggleDialogOpen(true)
  }, [])

  const handleConfirmToggle = useCallback(async () => {
    if (!targetUser) return
    setIsSubmitting(true)
    try {
      await updateUser(targetUser.id, { is_active: !targetUser.is_active })
      toast.success(`Usuário ${targetUser.is_active ? "desativado" : "ativado"} com sucesso!`)
      setIsToggleDialogOpen(false)
      setTargetUser(null)
      fetchUsers(filters)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar status")
    } finally {
      setIsSubmitting(false)
    }
  }, [targetUser, updateUser, fetchUsers, filters])

  const handleCreateUser = useCallback(async (data: CreateUserFormData) => {
    setIsSubmitting(true)
    try {
      await createUser(data)
      toast.success("Usuário criado com sucesso!")
      setIsCreateDialogOpen(false)
      fetchUsers(filters)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar usuário")
    } finally {
      setIsSubmitting(false)
    }
  }, [createUser, fetchUsers, filters])

  if (!canAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
        <ShieldAlert className="h-12 w-12" />
        <p>Acesso restrito a administradores.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-0 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground mt-1">
          {totalCount} usuário{totalCount !== 1 ? "s" : ""} cadastrado{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      <UserDataTable
        users={users}
        isLoading={isLoading}
        currentUserId={currentUser?.id ?? ''}
        onAdd={() => setIsCreateDialogOpen(true)}
        onRoleChange={handleRoleChange}
        onToggleActive={handleToggleActive}
        onSearchChange={(search) => setFilters(f => ({ ...f, search: search || undefined }))}
        onRoleFilterChange={(role) => setFilters(f => ({ ...f, role: role === 'all' ? undefined : role || undefined }))}
        onStatusFilterChange={(is_active) => setFilters(f => ({ ...f, is_active: is_active === 'all' ? undefined : is_active || undefined }))}
      />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUser}
        isLoading={isSubmitting}
      />

      <ToggleUserActiveDialog
        open={isToggleDialogOpen}
        onOpenChange={setIsToggleDialogOpen}
        user={targetUser}
        onConfirm={handleConfirmToggle}
        isLoading={isSubmitting}
      />
    </div>
  )
}
