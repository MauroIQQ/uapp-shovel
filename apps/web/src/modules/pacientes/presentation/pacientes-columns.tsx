import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { calcularEdad, type Paciente } from "../domain/paciente.entity";

interface PacientesColumnsOptions {
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
}

export function usePacientesColumns({ onEdit, onDelete }: PacientesColumnsOptions): ColumnDef<Paciente>[] {
  return [
    {
      accessorKey: "rut",
      header: "RUT",
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.getValue<string>("rut")}</span>,
    },
    {
      accessorKey: "nombre_completo",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <UserRound className="size-4 text-muted-foreground" />
          </span>
          <div className="flex flex-col">
            <span className="truncate" title={row.getValue<string>("nombre_completo")}>
              {row.getValue("nombre_completo")}
            </span>
            <span className="text-muted-foreground text-xs">
              {row.original.sexo ?? "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "edad",
      header: "Edad",
      accessorFn: (row) => calcularEdad(row.fecha_nacimiento),
      cell: ({ row }) => {
        const edad = row.getValue<number | null>("edad");
        return <span className="tabular-nums">{edad !== null ? `${edad} años` : "-"}</span>;
      },
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.getValue<string | null>("telefono") ?? "-"}</span>,
    },
    {
      accessorKey: "celular",
      header: "Celular",
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.getValue<string | null>("celular") ?? "-"}</span>,
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
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue<string | null>("estado");
        if (!estado) return <span className="text-muted-foreground text-xs">-</span>;
        return (
          <span
            className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${
              estado === "activo"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {estado}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const paciente = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(paciente)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(paciente)}>
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
