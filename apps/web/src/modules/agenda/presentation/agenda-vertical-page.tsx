"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, MailCheck, MoreHorizontal } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useAgenda } from "../application/use-agenda";
import type { AgendaCita, HorarioSlot, TipoHora } from "../domain/agenda.entity";
import { deleteCita } from "../infrastructure/agenda.service";
import { CitaFormSheet } from "./cita-form-sheet";

interface AgendaVerticalPageProps {
  tipos: TipoHora[];
  horarios: HorarioSlot[];
}

export function AgendaVerticalPage({ tipos, horarios }: AgendaVerticalPageProps) {
  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { citas, loading, error, refresh } = useAgenda(todayStr);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingCita, setEditingCita] = React.useState<AgendaCita | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AgendaCita | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCita(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(cita: AgendaCita) {
    setEditingCita(cita);
    setSheetOpen(true);
  }

  function handleAdd() {
    setEditingCita(null);
    setSheetOpen(true);
  }

  const columns: ColumnDef<AgendaCita>[] = [
    {
      accessorKey: "fecha_hora",
      header: "Hora",
      cell: ({ row }) => {
        const d = new Date(row.original.fecha_hora);
        return (
          <span className="font-medium tabular-nums">
            {d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
    },
    {
      accessorKey: "paciente_nombre",
      header: "Paciente",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue<string>("paciente_nombre")}</span>
      ),
    },
    {
      accessorKey: "tipo_descripcion",
      header: "Tipo",
    },
    {
      accessorKey: "prevision_nombre",
      header: "Previsión",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue<string | null>("prevision_nombre") ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "confirmada",
      header: "Confirmada",
      cell: ({ row }) => (
        row.getValue("confirmada") === "SI"
          ? <Badge variant="default" className="text-[10px]">Sí</Badge>
          : <Badge variant="outline" className="text-[10px]">No</Badge>
      ),
    },
    {
      id: "sobrecupo",
      header: "S.Cupo",
      cell: ({ row }) => (
        row.original.sobrecupo
          ? <Badge variant="destructive" className="text-[10px]">SC</Badge>
          : null
      ),
    },
    {
      id: "atendido",
      header: "Atendido",
      cell: ({ row }) => (
        row.original.atendido === "SI"
          ? <Badge variant="secondary" className="text-[10px]">Sí</Badge>
          : <Badge variant="outline" className="text-[10px]">No</Badge>
      ),
      enableSorting: false,
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => {
        const cita = row.original;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-pointer">
                  {cita.recordatorio_creado ? (
                    <MailCheck className="size-4 text-emerald-600" />
                  ) : (
                    <Mail className="size-4 text-muted-foreground/40" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cita.recordatorio_creado ? "Email enviado" : "Sin email"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const cita = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Menú">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(cita)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(cita)}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <>
      <ServerDataTable
        columns={columns}
        data={citas}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="paciente_nombre"
        searchPlaceholder="Filtrar por paciente..."
        filterBar={
          <Button size="sm" onClick={handleAdd}>
            + Nueva cita
          </Button>
        }
        hideColumnsButton
      />

      <CitaFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cita={editingCita}
        fecha={todayStr}
        tipos={tipos}
        horarios={horarios}
        onSuccess={refresh}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cita de{" "}
              <strong>{deleteTarget?.paciente_nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
