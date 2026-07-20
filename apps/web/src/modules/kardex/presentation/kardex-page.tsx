"use client";

import * as React from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useBuscarArticulos } from "../application/buscar-articulos.use-case";
import type { KardexArticulo } from "../domain/kardex.entity";
import { deleteArticulo } from "../infrastructure/kardex.service";
import { useKardexColumns } from "./kardex-columns";
import { KardexFormSheet } from "./kardex-form-sheet";

export function KardexPage() {
  const { data, loading, error, refresh } = useBuscarArticulos();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<KardexArticulo | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<KardexArticulo | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const columns = useKardexColumns({
    onEdit: (item) => { setEditItem(item); setSheetOpen(true); },
    onDelete: (item) => setDeleteTarget(item),
  });

  function handleOpenNew() {
    setEditItem(null);
    setSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open);
    if (!open) setEditItem(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteArticulo(deleteTarget.id_articulo);
      setDeleteTarget(null);
      refresh();
    } catch {
      // silent
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
        searchColumn="descripcion"
        searchPlaceholder="Filtrar por descripción..."
        filterBar={
          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={handleOpenNew}
            >
              + Nuevo artículo
            </button>
          </div>
        }
      />

      <KardexFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        onSuccess={refresh}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.descripcion}</strong> del kardex.
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
