import type { ColumnDef } from "@tanstack/react-table";
import { Check, X, UserRound } from "lucide-react";

import type { PacienteBusqueda } from "../domain/busqueda.entity";

function formatEdad(fecha: string | null): string {
  if (!fecha) return "-";
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return `${edad} años`;
}

export const busquedaColumns: ColumnDef<PacienteBusqueda>[] = [
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
    accessorFn: (row) => formatEdad(row.fecha_nacimiento),
    cell: ({ row }) => <span className="tabular-nums">{row.getValue<string>("edad")}</span>,
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.getValue<string | null>("telefono") ?? "-"}</span>,
  },
  {
    id: "prevision",
    header: "Previsión",
    accessorFn: (row) => row.prevision,
    cell: ({ row }) => <span className="text-xs">{row.getValue<string | null>("prevision") ?? "-"}</span>,
  },
  {
    id: "ultima_cita",
    header: "Última Cita",
    accessorFn: (row) => {
      if (!row.ultima_cita) return "-";
      return new Date(row.ultima_cita).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
    cell: ({ row }) => {
      const fecha = row.original.ultima_cita;
      if (!fecha) return <span className="text-muted-foreground text-xs">-</span>;
      return (
        <div className="flex flex-col">
          <span className="tabular-nums text-xs">
            {new Date(fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
          <span className="tabular-nums text-muted-foreground text-[11px]">
            {new Date(fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </span>
        </div>
      );
    },
  },
  {
    id: "estado_cita",
    header: "Estado Cita",
    accessorFn: (row) => {
      const c = row.confirmada;
      const a = row.atendido;
      if (a === "SI") return "atendido";
      if (c === "SI") return "confirmado";
      return "pendiente";
    },
    cell: ({ row }) => {
      const c = row.original.confirmada;
      const a = row.original.atendido;
      if (a === "SI") {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Check className="size-3" /> Atendido
          </span>
        );
      }
      if (c === "SI") {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-medium text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Check className="size-3" /> Confirmado
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <X className="size-3" /> Pendiente
        </span>
      );
    },
  },
];
