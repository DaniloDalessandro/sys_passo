"use client"

import * as React from "react"
import {
  User,
  BarChart3,
  HelpCircle,
  Car,
} from "lucide-react"
import { useAuthContext } from "@/context/AuthContext"
// import { useDataRefresh } from "@/contexts/DataRefreshContext" // TODO: Check if exists
// import { toast } from "@/hooks/use-toast" // TODO: Check if exists

// Import API functions (commented out until APIs are created)
// import { createConductor } from "@/lib/api/conductors"
// import { createVehicle } from "@/lib/api/vehicles"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

// Import form components (commented out until forms are created)
// import ConductorForm from "@/components/forms/ConductorForm"
// import VehicleForm from "@/components/forms/VehicleForm"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: {
    title: string
    url: string
    action?: string
  }[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()
  // const { triggerRefresh } = useDataRefresh() // TODO: Check if exists
  const pathname = usePathname()

  // Form dialog states (commented out until forms are created)
  // const [dialogState, setDialogState] = React.useState({
  //   conductor: false,
  //   vehicle: false,
  // })

  // Handler to open specific form dialog
  const openFormDialog = (formType: string) => {
    console.log(`Opening form dialog for: ${formType}`)
    // TODO: Implement when forms are created
  }

  // Handler to close specific form dialog (not used currently)
  // const closeFormDialog = (formType: string) => {
  //   setDialogState(prev => ({ ...prev, [formType]: false }))
  // }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Condutores",
      url: "/conductors",
      icon: User,
      items: [
        { title: "Listar Condutores", url: "/conductors" },
        { title: "Buscar Condutores", url: "/conductors/search" },
        { title: "Estatísticas", url: "/conductors/stats" },
        { title: "Adicionar Condutor", url: "/conductors", action: "conductor" },
      ],
    },
    {
      title: "Veículos",
      url: "/vehicles",
      icon: Car,
      items: [
        { title: "Listar Veículos", url: "/vehicles" },
        { title: "Adicionar Veículo", url: "/vehicles", action: "vehicle" },
      ],
    },
    {
      title: "Ajuda",
      url: "/ajuda",
      icon: HelpCircle,
    },
  ]

  if (!user) return null

  // Sidebar normal (com expandir/recolher)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
              <Car className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">ViaLumiar</span>
              <span className="truncate text-xs">Sistema de Gestão</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} onFormAction={openFormDialog} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: (user.name || user.email.split("@")[0]).replace(/^Employee\s+/i, ""),
            email: user.email,
            avatar: user.avatar || "/avatars/default.svg",
          }}
        />
      </SidebarFooter>

      <SidebarRail />

      {/* Form Dialogs - TODO: Implement when forms are created */}
    </Sidebar>
  )
}