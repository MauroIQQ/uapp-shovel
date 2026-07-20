import type { ColumnDef } from "@tanstack/react-table";
import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Empresa } from "../domain/empresa.entity";

interface EmpresasColumnsOptions {
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

export function useEmpresasColumns({ onEdit, onDelete }: EmpresasColumnsOptions): ColumnDef<Empresa>[] {
  return [
    {
      accessorKey: "rut_empresa",
      header: "RUT Empresa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <Building2 className="size-4 text-muted-foreground" />
          </span>
          <span className="font-medium tabular-nums">{row.getValue<string>("rut_empresa")}</span>
        </div>
      ),
    },
    {
      accessorKey: "giro",
      header: "Giro",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {row.getValue<string | null>("giro") ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {row.getValue<string | null>("correo") ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => (
        <span className="text-xs tabular-nums">{row.getValue<string | null>("telefono") ?? "-"}</span>
      ),
    },
    {
      accessorKey: "nombre_representante",
      header: "Representante",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {row.getValue<string | null>("nombre_representante") ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue<string | null>("estado");
        if (!estado) return <span className="text-xs text-muted-foreground">-</span>;
        return (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
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
        const empresa = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(empresa)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(empresa)}>
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
