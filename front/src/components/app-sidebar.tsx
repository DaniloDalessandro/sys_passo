"use client"

import * as React from "react"
import {
  SquareTerminal,
  FileText,
  BarChart3,
  HelpCircle,
  Anchor,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Conductors",
      url: "/conductors",
      icon: SquareTerminal,
    },
    {
      title: "Vehicles",
      url: "/vehicles",
      icon: FileText,
    },
    {
      title: "Ajuda",
      url: "/ajuda",
      icon: HelpCircle,
    },
  ]

  // Sidebar normal (com expandir/recolher)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
              <Anchor className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Minerva</span>
              <span className="truncate text-xs">Gestão de Contratos</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-center text-xs text-gray-500">
          Sistema Minerva v1.0
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
