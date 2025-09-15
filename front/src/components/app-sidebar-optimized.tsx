"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  SquareTerminal,
  HandCoins,
  FileText,
  Landmark,
  Wallet,
  Building2,
  Layers,
  Bot,
  BarChart3,
  HelpCircle,
  Anchor,
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

// Memoize os itens de navegação para evitar recriação a cada render
const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboards",
    url: "/dashboard",
    icon: BarChart3,
    items: [
      { title: "Visão Geral", url: "/dashboard" },
      { title: "Contratos", url: "/dashboard/contratos" },
      { title: "Orçamentos", url: "/dashboard/orcamentos" },
      { title: "Auxilios", url: "/dashboard/auxilios" },
    ],
  },
  {
    title: "Colaboradores",
    url: "/colaboradores",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Buscar", url: "/colaboradores" },
      { title: "Adicionar", url: "/colaboradores" },
    ],
  },
  {
    title: "Auxílios",
    url: "/auxilios",
    icon: HandCoins,
    items: [
      { title: "Buscar", url: "/auxilios" },
      { title: "Buscar Todos", url: "/auxilios" },
      { title: "Adicionar", url: "/auxilios" },
    ],
  },
  {
    title: "Contratos",
    url: "/contratos",
    icon: FileText,
    items: [
      { title: "Buscar", url: "/contratos" },
      { title: "Adicionar", url: "/contratos" },
    ],
  },
  {
    title: "Linhas Orçamentárias",
    url: "/linhas-orcamentarias",
    icon: Landmark,
    items: [
      { title: "Buscar", url: "/linhas-orcamentarias" },
      { title: "Adicionar", url: "/linhas-orcamentarias" },
    ],
  },
  {
    title: "Orçamentos",
    url: "/orcamento",
    icon: Wallet,
    items: [
      { title: "Buscar", url: "/orcamento" },
      { title: "Adicionar", url: "/orcamento" },
    ],
  },
  {
    title: "Setores",
    url: "/setor",
    icon: Building2,
    items: [
      { title: "Buscar", url: "/setor" },
      { title: "Adicionar", url: "/setor" },
    ],
  },
  {
    title: "Centros",
    url: "/centro",
    icon: Layers,
    items: [
      { title: "Buscar", url: "/centro" },
      { title: "Adicionar", url: "/centro" },
    ],
  },
  {
    title: "Fale com Alice",
    url: "/alice",
    icon: Bot,
  },
  {
    title: "Ajuda",
    url: "/ajuda",
    icon: HelpCircle,
  },
]

// Memoize o header do logo para evitar re-renderização
const SidebarLogo = React.memo(() => (
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
))

SidebarLogo.displayName = "SidebarLogo"

// Memoize a sidebar fixa para Alice
const AliceSidebar = React.memo(({ user, ...props }: { user: any } & React.ComponentProps<typeof Sidebar>) => (
  <aside className="w-64 bg-white border-r flex flex-col" {...props}>
    <div className="p-4 border-b">
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
    <div className="flex-1 overflow-y-auto">
      <NavMain items={NAV_ITEMS} />
    </div>
    <div className="p-4 border-t">
      <NavUser
        user={{
          name: user.name || user.email.split("@")[0],
          email: user.email,
          avatar: user.avatar || "/avatars/default.svg",
        }}
      />
    </div>
  </aside>
))

AliceSidebar.displayName = "AliceSidebar"

// Memoize o NavUser para evitar recriação
const MemoizedNavUser = React.memo(({ user }: { user: any }) => (
  <NavUser
    user={{
      name: user.name || user.email.split("@")[0],
      email: user.email,
      avatar: user.avatar || "/avatars/default.svg",
    }}
  />
))

MemoizedNavUser.displayName = "MemoizedNavUser"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()
  const pathname = usePathname()

  // Memoize a verificação da página Alice
  const isAlicePage = React.useMemo(() => 
    pathname.startsWith("/alice"), 
    [pathname]
  )

  // Early return se não há usuário
  if (!user) return null

  // Sidebar fixa para Alice
  if (isAlicePage) {
    return <AliceSidebar user={user} {...props} />
  }

  // Sidebar normal (com expandir/recolher)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={NAV_ITEMS} />
      </SidebarContent>

      <SidebarFooter>
        <MemoizedNavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}