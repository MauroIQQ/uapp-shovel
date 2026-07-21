"use client";

import * as React from "react";

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

import { useBuscarHorasBloqueadas } from "../application/buscar-horas-bloqueadas.use-case";
import type { HoraBloqueada } from "../domain/hora-bloqueada.entity";
import { deleteHoraBloqueada } from "../infrastructure/horas-bloqueadas.service";
import { HoraBloqueadaFormSheet } from "./hora-bloqueada-form-sheet";
import { useHorasBloqueadasColumns } from "./horas-bloqueadas-columns";

export function HorasBloqueadasPage() {
  const { data, loading, error, refresh } = useBuscarHorasBloqueadas();
  const [deleteTarget, setDeleteTarget] = React.useState<HoraBloqueada | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const columns = useHorasBloqueadasColumns({
    onDelete: (item) => setDeleteTarget(item),
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteHoraBloqueada(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch {
      /* silent */
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ServerDataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="motivo"
        searchPlaceholder="Filtrar por motivo..."
        filterBar={
          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs hover:bg-primary/90"
              onClick={() => setSheetOpen(true)}
            >
              + Bloquear horario
            </button>
          </div>
        }
        hideColumnsButton
      />

      <HoraBloqueadaFormSheet open={sheetOpen} onOpenChange={setSheetOpen} onSuccess={refresh} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desbloquear horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el bloqueo del <strong>{deleteTarget?.hora}</strong> el día{" "}
              <strong>{deleteTarget?.fecha}</strong>
              {deleteTarget?.motivo && ` (${deleteTarget.motivo})`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting ? "Eliminando..." : "Desbloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
