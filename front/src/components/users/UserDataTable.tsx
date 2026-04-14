"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SystemUser, UserRole } from "@/hooks/useUsers"
import { RoleChangerSelect } from "./RoleChangerSelect"
import { Search, UserPlus, Loader2 } from "lucide-react"

interface Props {
  users: SystemUser[]
  isLoading: boolean
  currentUserId: string
  onAdd: () => void
  onRoleChange: (userId: number, role: UserRole) => void
  onToggleActive: (user: SystemUser) => void
  onSearchChange: (search: string) => void
  onRoleFilterChange: (role: string) => void
  onStatusFilterChange: (status: string) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function getDisplayName(user: SystemUser) {
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return full || user.username
}

export function UserDataTable({
  users,
  isLoading,
  currentUserId,
  onAdd,
  onRoleChange,
  onToggleActive,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
}: Props) {
  const [search, setSearch] = useState('')

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearchChange(search)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nome, usuário ou e-mail..."
              className="pl-8 w-60"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <Select onValueChange={onRoleFilterChange} defaultValue="all">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todos os papéis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os papéis</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="approver">Aprovador</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={onStatusFilterChange} defaultValue="all">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuário</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Papel</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cadastro</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map(user => {
                const isSelf = user.id === Number(currentUserId)
                return (
                  <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{getDisplayName(user)}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleChangerSelect
                        userId={user.id}
                        currentRole={user.role}
                        onRoleChange={onRoleChange}
                        disabled={isSelf}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(user.date_joined)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          isSelf
                            ? "text-muted-foreground cursor-not-allowed"
                            : user.is_active
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        }
                        onClick={() => !isSelf && onToggleActive(user)}
                        disabled={isSelf}
                      >
                        {user.is_active ? "Desativar" : "Ativar"}
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
