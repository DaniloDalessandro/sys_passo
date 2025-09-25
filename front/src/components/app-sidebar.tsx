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
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()
  const pathname = usePathname()

  // Itens de navegação baseados apenas nas páginas que realmente existem
  const navItems: NavItem[] = React.useMemo(() => [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      title: "Condutores",
      url: "/conductors",
      icon: Users,
      isActive: pathname.startsWith("/conductors"),
    },
    {
      title: "Veículos",
      url: "/vehicles",
      icon: Truck,
      isActive: pathname.startsWith("/vehicles"),
    },
    {
      title: "Ajuda",
      url: "/ajuda",
      icon: HelpCircle,
      isActive: pathname.startsWith("/ajuda"),
    },
  ], [pathname])

  if (!user) return null

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
              <span className="truncate text-xs">Gestão de Contratos</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name || user.email?.split("@")[0] || "Usuário",
            email: user.email || "",
            avatar: "/avatars/default.svg",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}