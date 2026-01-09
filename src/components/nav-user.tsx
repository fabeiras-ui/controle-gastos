"use client"

import * as React from "react"
import {
	BadgeCheck,
	Bell,
	ChevronRight,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
} from "lucide-react"

import {signOut} from "next-auth/react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
	                        user,
                        }: {
	user: {
		name: string
		email: string
		avatar: string
	}
}) {
	const {isMobile} = useSidebar()

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild className={"w-full"}>
						<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							<div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs">
								{user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4"/>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<div
										className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center font-medium text-xs">
										{user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{user.name}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator/>
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles className="mr-2"/>
								Atualizar para Pro
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator/>
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck className="mr-2"/>
								Conta
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard className="mr-2"/>
								Cobrança
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell className="mr-2"/>
								Notificações
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator/>
						<DropdownMenuGroup>
							<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
								<LogOut className="mr-2"/>
								Sair
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
