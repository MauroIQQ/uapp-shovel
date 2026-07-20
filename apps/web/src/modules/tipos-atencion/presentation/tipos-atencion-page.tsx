"use client";

import * as React from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useBuscarTiposAtencion } from "../application/buscar-tipos-atencion.use-case";
import type { TipoAtencion } from "../domain/tipo-atencion.entity";
import { deleteTipoAtencion } from "../infrastructure/tipos-atencion.service";
import { useTiposAtencionColumns } from "./tipos-atencion-columns";
import { TipoAtencionFormSheet } from "./tipo-atencion-form-sheet";

export function TiposAtencionPage() {
  const { data, loading, error, refresh } = useBuscarTiposAtencion();
  const [editing, setEditing] = React.useState<TipoAtencion | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TipoAtencion | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const columns = useTiposAtencionColumns({
    onEdit: (item) => { setEditing(item); setSheetOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteTipoAtencion(deleteTarget.id); setDeleteTarget(null); refresh(); } catch { /* silent */ } finally { setDeleting(false); }
  }

  return (
    <>
      <ServerDataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="descripcion"
        searchPlaceholder="Filtrar por descripción..."
        filterBar={
          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => { setEditing(null); setSheetOpen(true); }}
            >
              + Nuevo tipo
            </button>
          </div>
        }
        hideColumnsButton
      />

      <TipoAtencionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tipoAtencion={editing}
        onSuccess={refresh}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de atención?</AlertDialogTitle>
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
