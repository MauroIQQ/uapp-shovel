"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Clock, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { HoraBloqueada } from "../domain/hora-bloqueada.entity";

interface HorasBloqueadasColumnsOptions {
  onDelete: (item: HoraBloqueada) => void;
}

export function useHorasBloqueadasColumns({ onDelete }: HorasBloqueadasColumnsOptions): ColumnDef<HoraBloqueada>[] {
  return [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const fecha = row.getValue<string>("fecha");
        const d = new Date(`${fecha}T12:00:00`);

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium tabular-nums">
              {d.toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "hora",
      header: "Hora",
      cell: ({ row }) => {
        const hora = row.getValue<string>("hora");
        return (
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
              <Clock className="size-4 text-muted-foreground" />
            </span>
            <span className="font-medium tabular-nums">{hora}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
      cell: ({ row }) => {
        const motivo = row.getValue<string | null>("motivo");
        return <span className="text-muted-foreground">{motivo ?? "—"}</span>;
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
