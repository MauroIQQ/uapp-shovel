import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Pill, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Medicamento } from "../domain/medicamento.entity";

interface MedicamentosColumnsOptions {
  onEdit: (medicamento: Medicamento) => void;
  onDelete: (medicamento: Medicamento) => void;
}

export function useMedicamentosColumns({ onEdit, onDelete }: MedicamentosColumnsOptions): ColumnDef<Medicamento>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Medicamento",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
            <Pill className="size-4 text-muted-foreground" />
          </span>
          <span className="font-medium">{row.getValue<string>("nombre")}</span>
        </div>
      ),
    },
    {
      accessorKey: "categoria_nombre",
      header: "Categoría",
      cell: ({ row }) => (
        <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
          {row.getValue<string>("categoria_nombre")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const medicamento = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(medicamento)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(medicamento)}>
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
