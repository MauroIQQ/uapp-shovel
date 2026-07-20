"use client";

import { Building, ChevronsUpDown, Stethoscope } from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-10 items-center justify-center group-data-[collapsible=icon]:size-8">
                <Image
                  src="/uapp-logo-system.png"
                  alt="UAPP"
                  width={1000}
                  height={1000}
                  className="block size-7 group-data-[collapsible=icon]:size-6 dark:hidden"
                />
                <Image
                  src="/uapp-logo-system-dark.png"
                  alt="UAPP"
                  width={1000}
                  height={1000}
                  className="hidden size-7 group-data-[collapsible=icon]:size-6 dark:block"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">UAPP</span>
                <span className="truncate text-xs">Software clínico</span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="start" sideOffset={4}>
            <DropdownMenuLabel className="text-muted-foreground text-xs">Apps</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-sidebar-primary text-sidebar-primary-foreground">
                <Stethoscope className="size-4" />
              </div>
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-medium">UAPP</span>
                <span className="truncate text-xs">Software clínico</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                <Building className="size-4" />
              </div>
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-medium">Consultorio</span>
                <span className="truncate text-xs">Gestión administrativa</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
