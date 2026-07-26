"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Direccion } from "../domain/direccion.entity";

interface DireccionesColumnsOptions {
  onEdit: (direccion: Direccion) => void;
  onDelete: (direccion: Direccion) => void;
}

export function useDireccionesColumns({ onEdit, onDelete }: DireccionesColumnsOptions): ColumnDef<Direccion>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <MapPin className="size-4 text-muted-foreground" />
          </span>
          <span className="font-medium">{row.getValue<string>("nombre")}</span>
        </div>
      ),
    },
    {
      accessorKey: "direccion",
      header: "Dirección",
      cell: ({ row }) => {
        const d = row.original;
        const parts = [d.direccion, d.piso && `Piso ${d.piso}`, d.oficina && `Of. ${d.oficina}`].filter(Boolean);
        return <span className="text-muted-foreground text-xs">{parts.join(", ")}</span>;
      },
    },
    {
      accessorKey: "comuna",
      header: "Comuna",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.getValue<string | null>("comuna") ?? "-"}</span>
      ),
    },
    {
      accessorKey: "ciudad",
      header: "Ciudad",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.getValue<string | null>("ciudad") ?? "-"}</span>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => {
        const activo = row.getValue<boolean>("activo");
        return (
          <span
            className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${
              activo
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {activo ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const direccion = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(direccion)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(direccion)}>
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
