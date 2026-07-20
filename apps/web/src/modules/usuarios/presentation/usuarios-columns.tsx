import type { ColumnDef } from "@tanstack/react-table";
import { PERFIL_NOMBRES, type Perfil } from "@uapp/shared";
import { MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { nombreCompleto, type Usuario } from "../domain/usuario.entity";

interface UsuariosColumnsOptions {
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

export function useUsuariosColumns({ onEdit, onDelete }: UsuariosColumnsOptions): ColumnDef<Usuario>[] {
  return [
    {
      accessorKey: "rut",
      header: "RUT",
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.getValue<string>("rut")}</span>,
    },
    {
      id: "nombre_completo",
      header: "Nombre",
      accessorFn: (row) => nombreCompleto(row),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <UserRound className="size-4 text-muted-foreground" />
          </span>
          <span className="whitespace-nowrap">{nombreCompleto(row.original)}</span>
        </div>
      ),
    },
    {
      accessorKey: "perfil",
      header: "Perfil",
      cell: ({ row }) => {
        const perfil = row.getValue<number>("perfil");
        const nombre = PERFIL_NOMBRES[perfil as Perfil] ?? "Desconocido";
        return (
          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-400">
            {nombre}
          </span>
        );
      },
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground text-xs">
          {row.getValue<string | null>("correo") ?? "-"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const usuario = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(usuario)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(usuario)}>
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
