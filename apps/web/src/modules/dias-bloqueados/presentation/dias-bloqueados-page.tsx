"use client";

import * as React from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useBuscarDiasBloqueados } from "../application/buscar-dias-bloqueados.use-case";
import type { DiaBloqueado } from "../domain/dia-bloqueado.entity";
import { deleteDiaBloqueado } from "../infrastructure/dias-bloqueados.service";
import { useDiasBloqueadosColumns } from "./dias-bloqueados-columns";
import { DiaBloqueadoFormSheet } from "./dia-bloqueado-form-sheet";

export function DiasBloqueadosPage() {
  const { data, loading, error, refresh } = useBuscarDiasBloqueados();
  const [deleteTarget, setDeleteTarget] = React.useState<DiaBloqueado | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const columns = useDiasBloqueadosColumns({
    onDelete: (item) => setDeleteTarget(item),
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteDiaBloqueado(deleteTarget.fecha); setDeleteTarget(null); refresh(); } catch { /* silent */ } finally { setDeleting(false); }
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
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => setSheetOpen(true)}
            >
              + Bloquear día
            </button>
          </div>
        }
        hideColumnsButton
      />

      <DiaBloqueadoFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={refresh}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desbloquear día?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el bloqueo del día{" "}
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
