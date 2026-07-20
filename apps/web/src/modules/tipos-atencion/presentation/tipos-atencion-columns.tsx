"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { TipoAtencion } from "../domain/tipo-atencion.entity";

interface TiposAtencionColumnsOptions {
  onEdit: (item: TipoAtencion) => void;
  onDelete: (item: TipoAtencion) => void;
}

export function useTiposAtencionColumns({ onEdit, onDelete }: TiposAtencionColumnsOptions): ColumnDef<TipoAtencion>[] {
  return [
    {
      accessorKey: "descripcion",
      header: "Tipo de Atención",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </span>
          <span className="font-medium">{row.getValue<string>("descripcion")}</span>
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue<string>("estado");
        return (
          <Badge variant={estado === "activo" ? "secondary" : "outline"} className="rounded-sm px-1 text-[10px]">
            {estado === "activo" ? "Activo" : "Inactivo"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
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
