"use client";

import * as React from "react";

import { Plus } from "lucide-react";

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
import { Button } from "@/components/ui/button";

import { useDirecciones } from "../application/use-direcciones";
import type { Direccion } from "../domain/direccion.entity";
import { deleteDireccion } from "../infrastructure/direcciones.service";
import { DireccionFormSheet } from "./direccion-form-sheet";
import { useDireccionesColumns } from "./direcciones-columns";

export function DireccionesSection() {
  const { data, loading, error, refresh } = useDirecciones();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editDireccion, setEditDireccion] = React.useState<Direccion | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Direccion | null>(null);

  const columns = useDireccionesColumns({
    onEdit: (d) => {
      setEditDireccion(d);
      setSheetOpen(true);
    },
    onDelete: (d) => setDeleteTarget(d),
  });

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteDireccion(deleteTarget.id);
      refresh();
    } catch {
      // silent
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Direcciones</h3>
          <p className="text-muted-foreground text-sm">Sucursales y lugares de atención de la empresa</p>
        </div>
        <Button
          onClick={() => {
            setEditDireccion(null);
            setSheetOpen(true);
          }}
        >
          <Plus />
          Nueva Dirección
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="nombre"
        searchPlaceholder="Filtrar por nombre..."
        hideColumnsButton
      />

      <DireccionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        direccion={editDireccion}
        onSuccess={refresh}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la dirección{" "}
              <strong>{deleteTarget?.nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
