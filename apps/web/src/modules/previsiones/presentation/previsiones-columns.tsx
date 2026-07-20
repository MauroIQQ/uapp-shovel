"use client";

import { Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Prevision } from "../domain/prevision.entity";

interface PrevisionesColumnsOptions {
  onEdit: (item: Prevision) => void;
  onDelete: (item: Prevision) => void;
}

export function usePrevisionesColumns({ onEdit, onDelete }: PrevisionesColumnsOptions): ColumnDef<Prevision>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Previsión",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <Coins className="size-4 text-muted-foreground" />
          </span>
          <span className="font-medium">{row.getValue<string>("nombre")}</span>
        </div>
      ),
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          ${row.getValue<number>("valor")?.toLocaleString("es-CL") ?? 0}
        </span>
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
