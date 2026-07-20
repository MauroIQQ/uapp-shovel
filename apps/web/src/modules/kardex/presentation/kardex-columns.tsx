"use client";

import { Package } from "lucide-react";

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

import type { KardexArticulo } from "../domain/kardex.entity";

interface KardexColumnsOptions {
  onEdit: (item: KardexArticulo) => void;
  onDelete: (item: KardexArticulo) => void;
}

export function useKardexColumns({ onEdit, onDelete }: KardexColumnsOptions): ColumnDef<KardexArticulo>[] {
  return [
    {
      accessorKey: "descripcion",
      header: "Artículo",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <Package className="size-4 text-muted-foreground" />
          </span>
          <span className="font-medium">{row.getValue<string>("descripcion")}</span>
        </div>
      ),
    },
    {
      accessorKey: "stock_actual",
      header: "Stock actual",
      cell: ({ row }) => {
        const stock = row.getValue<number>("stock_actual");
        return (
          <span className="tabular-nums font-medium">{stock.toLocaleString("es-CL")}</span>
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
