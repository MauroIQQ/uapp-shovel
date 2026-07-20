"use client";

import * as React from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useBuscarPrevisiones } from "../application/buscar-previsiones.use-case";
import type { Prevision } from "../domain/prevision.entity";
import { deletePrevision } from "../infrastructure/previsiones.service";
import { usePrevisionesColumns } from "./previsiones-columns";
import { PrevisionFormSheet } from "./prevision-form-sheet";

export function PrevisionesPage() {
  const { data, loading, error, refresh } = useBuscarPrevisiones();
  const [editing, setEditing] = React.useState<Prevision | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Prevision | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const columns = usePrevisionesColumns({
    onEdit: (item) => { setEditing(item); setSheetOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deletePrevision(deleteTarget.id); setDeleteTarget(null); refresh(); } catch { /* silent */ } finally { setDeleting(false); }
  }

  return (
    <>
      <ServerDataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="nombre"
        searchPlaceholder="Filtrar por nombre..."
        filterBar={
          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => { setEditing(null); setSheetOpen(true); }}
            >
              + Nueva previsión
            </button>
          </div>
        }
        hideColumnsButton
      />

      <PrevisionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        prevision={editing}
        onSuccess={refresh}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar previsión?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
