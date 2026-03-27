"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRole } from "@/hooks/useUsers"

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  approver: 'Aprovador',
  viewer: 'Visualizador',
}

interface RoleChangerSelectProps {
  userId: number
  currentRole: UserRole
  onRoleChange: (userId: number, newRole: UserRole) => void
  disabled?: boolean
}

export function RoleChangerSelect({ userId, currentRole, onRoleChange, disabled }: RoleChangerSelectProps) {
  return (
    <Select
      value={currentRole}
      onValueChange={(val) => onRoleChange(userId, val as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-40 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([val, label]) => (
          <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
