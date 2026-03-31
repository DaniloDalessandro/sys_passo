"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserFormData, UserRole } from "@/hooks/useUsers"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserFormData) => Promise<void>
  isLoading?: boolean
}

const INITIAL: CreateUserFormData = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'viewer',
}

export function CreateUserDialog({ open, onOpenChange, onSubmit, isLoading = false }: Props) {
  const [form, setForm] = useState<CreateUserFormData>(INITIAL)

  const handleChange = (key: keyof CreateUserFormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
    setForm(INITIAL)
  }

  const handleClose = (open: boolean) => {
    if (!open) setForm(INITIAL)
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={form.first_name}
                onChange={e => handleChange('first_name', e.target.value)}
                placeholder="Nome"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={form.last_name}
                onChange={e => handleChange('last_name', e.target.value)}
                placeholder="Sobrenome"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username">Usuário *</Label>
            <Input
              id="username"
              required
              value={form.username}
              onChange={e => handleChange('username', e.target.value)}
              placeholder="nome.usuario"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              required
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              required
              type="password"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Papel</Label>
            <Select value={form.role} onValueChange={val => handleChange('role', val as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizador</SelectItem>
                <SelectItem value="approver">Aprovador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
