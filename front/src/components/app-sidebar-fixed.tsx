"use client"

import * as React from "react"
import {
  BarChart3,
  Users,
  Truck,
  HelpCircle,
  Car,
} from "lucide-react"
import { useAuthContext } from "@/context/AuthContext"
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

interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: {
    title: string
    url: string
    action?: string
  }[]
}

// Itens de navegação corrigidos - apenas rotas que existem
const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    items: [
      { title: "Visão Geral", url: "/dashboard" },
    ],
  },
  {
    title: "Condutores",
    url: "/conductors",
    icon: Users,
    items: [
      { title: "Listar", url: "/conductors" },
      { title: "Adicionar", url: "/conductors", action: "add-conductor" },
    ],
  },
  {
    title: "Veículos",
    url: "/vehicles",
    icon: Truck,
    items: [
      { title: "Listar", url: "/vehicles" },
      { title: "Adicionar", url: "/vehicles", action: "add-vehicle" },
    ],
  },
  {
    title: "Ajuda",
    url: "/ajuda",
    icon: HelpCircle,
  },
]

function SidebarLogo() {
  return (
    <div className="flex h-14 items-center px-4">
      <div className="flex items-center gap-2">
        <div className="bg-blue-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
          <Car className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">ViaLumiar</span>
          <span className="truncate text-xs">Gestão de Contratos</span>
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()
  const pathname = usePathname()

  // Marcar item ativo baseado na rota atual
  const navItemsWithActiveState = React.useMemo(() => {
    return NAV_ITEMS.map(item => ({
      ...item,
      isActive: pathname.startsWith(item.url)
    }))
  }, [pathname])

  // Função para lidar com ações de formulário
  const handleFormAction = React.useCallback((formType: string) => {
    switch (formType) {
      case 'add-conductor':
        console.log('Abrir modal de adicionar condutor')
        // Implementar lógica para abrir modal/formulário
        break
      case 'add-vehicle':
        console.log('Abrir modal de adicionar veículo')
        // Implementar lógica para abrir modal/formulário
        break
      default:
        console.log('Ação desconhecida:', formType)
    }
  }, [])

  // Early return se não há usuário
  if (!user) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={navItemsWithActiveState}
          onFormAction={handleFormAction}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name || user.email.split("@")[0],
            email: user.email,
            avatar: user.avatar || "/avatars/default.svg",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}