"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NotificationBadge } from "@/components/NotificationBadge"
import { usePathname } from "next/navigation"
import React, { memo, useMemo } from "react"

const capitalize = (s: string) => {
  if (typeof s !== "string" || s.length === 0) {
    return ""
  }
  const decodedString = decodeURIComponent(s)
  return (
    decodedString.charAt(0).toUpperCase() +
    decodedString.slice(1).replace(/-/g, " ")
  )
}

const MemoizedBreadcrumb = memo(({ pathSegments }: { pathSegments: string[] }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const isLast = index === pathSegments.length - 1

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium">{capitalize(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {capitalize(segment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
})

MemoizedBreadcrumb.displayName = "MemoizedBreadcrumb"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  
  const pathSegments = useMemo(
    () => pathname.split("/").filter((segment) => segment),
    [pathname]
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden w-full">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-10 transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_0_oklch(0.511_0.262_276.966/4%),0_4px_16px_-4px_oklch(0_0_0/4%)]">
          <SidebarTrigger className="-ml-1 hover:bg-accent transition-colors rounded-lg" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <MemoizedBreadcrumb pathSegments={pathSegments} />
          <div className="ml-auto flex items-center gap-2">
            <NotificationBadge />
          </div>
        </header>
        <main className="flex-1 p-4 overflow-hidden w-full animate-fade-in">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}