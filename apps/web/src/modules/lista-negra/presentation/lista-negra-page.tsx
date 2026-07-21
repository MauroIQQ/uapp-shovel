"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

import { useBlacklist } from "../application/use-blacklist";
import type { BlacklistedPatient } from "../domain/blacklist.entity";
import { useState } from "react";

function formatDate(d: Date | string | null): string {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })
}

export function ListaNegraPage() {
  const { data, loading, error, refresh, unblacklist } = useBlacklist()
  const [confirmRut, setConfirmRut] = useState<string | null>(null)

  const columns: ColumnDef<BlacklistedPatient>[] = [
    {
      accessorKey: "rut",
      header: "RUT",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">{row.getValue<string>("rut")}</span>
      ),
    },
    {
      accessorKey: "nombre_completo",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="size-3.5" />
          </span>
          <span>{row.getValue<string>("nombre_completo")}</span>
        </div>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => <span className="text-sm tabular-nums">{row.getValue<string | null>("telefono") ?? "-"}</span>,
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.getValue<string | null>("correo") ?? "-"}</span>
      ),
    },
    {
      accessorKey: "no_show_count",
      header: "Inasistencias",
      cell: ({ row }) => {
        const count = row.getValue<number>("no_show_count")
        return (
          <Badge variant={count >= 5 ? "destructive" : "secondary"} className="tabular-nums">
            {count}
          </Badge>
        )
      },
    },
    {
      accessorKey: "updated",
      header: "Última actualización",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue<Date | null>("updated"))}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const paciente = row.original
        return (
          <Button variant="outline" size="sm" onClick={() => setConfirmRut(paciente.rut)}>
            <ShieldCheck className="mr-1 size-3.5" />
            Quitar de lista
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Lista Negra</h1>
          <p className="text-muted-foreground text-sm">
            Pacientes con inasistencias recurrentes (auto-gestionado)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          {loading ? "Cargando..." : "Actualizar"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      <ServerDataTable
        columns={columns}
        data={data}
        loading={loading}
        searchColumn="rut"
        searchPlaceholder="Buscar por RUT..."
      />

      <AlertDialog open={!!confirmRut} onOpenChange={(open) => !open && setConfirmRut(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar de lista negra?</AlertDialogTitle>
            <AlertDialogDescription>
              El paciente {data.find((p) => p.rut === confirmRut)?.nombre_completo} dejará de aparecer como alerta
              al agendar citas. Su contador de inasistencias se reiniciará a 0.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmRut) {
                  await unblacklist(confirmRut)
                  setConfirmRut(null)
                }
              }}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
