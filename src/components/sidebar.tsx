"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  Command,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { PresenceBar } from "@/components/PresenceBar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { SettingsDialog } from "@/components/settings-dialog"
import { useSession } from "next-auth/react"

const data = {
  navMain: [
    {
      title: "Painel",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Time",
      url: "/team",
      icon: Users,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = React.useState(false)
  const [userData, setUserData] = React.useState<{ name: string; email: string; avatar: string } | null>(null)

  React.useEffect(() => {
    setMounted(true)
    const fetchUserData = () => {
      fetch("/api/users/me")
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUserData({
              name: data.nickname || data.name || "Usuário",
              email: data.email,
              avatar: data.image || ""
            })
          }
        })
        .catch(err => console.error("Error fetching user data:", err))
    }

    fetchUserData()
    // Opcional: Adicionar um intervalo para atualizar se houver mudanças frequentes
    // ou usar um evento customizado
    window.addEventListener('user-updated', fetchUserData)
    return () => window.removeEventListener('user-updated', fetchUserData)
  }, []) // Remove dependency on session

  const user = userData || {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  // Prevenir erros de hidratação garantindo que o conteúdo que depende da sessão
  // seja consistente entre servidor e cliente no primeiro render
  const isLoading = !mounted

  if (!mounted) {
    return null
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => router.push("/dashboard")}
            >
              <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground transform rotate-45"></div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Vault</span>
                <span className="truncate text-xs">Controle de Gastos</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={pathname === item.url}
                      onClick={() => router.push(item.url)}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <SidebarMenuItem>
                <SettingsDialog />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <PresenceBar />
        {!isLoading && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
