"use client";

import { LogOut, User } from "lucide-react";

import { PERFIL_NOMBRES, type Perfil } from "@uapp/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";

export function AccountSwitcher() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const fullName = `${user.nombre} ${user.paterno}${user.materno ? ` ${user.materno}` : ""}`;
  const email = user.correo ?? user.rut;
  const perfilNombre = PERFIL_NOMBRES[user.perfil as Perfil] ?? "Desconocido";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center justify-center rounded-lg hover:bg-muted transition-colors size-8">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{getInitials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{fullName}</span>
              <span className="truncate text-muted-foreground text-xs">{email}</span>
              <span className="text-[11px] text-muted-foreground">{user.rut_empresa}</span>
              <span className="text-[11px] text-muted-foreground">{perfilNombre}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
