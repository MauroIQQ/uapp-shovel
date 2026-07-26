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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDirecciones } from "../application/use-direcciones";
import type { Direccion } from "../domain/direccion.entity";
import { createDireccion, deleteDireccion } from "../infrastructure/direcciones.service";
import { DireccionFormSheet } from "./direccion-form-sheet";
import { useDireccionesColumns } from "./direcciones-columns";

interface EmpresaOption {
  rut_empresa: string;
  nombre: string;
}

interface DireccionesSectionProps {
  empresas: EmpresaOption[];
}

export function DireccionesSection({ empresas }: DireccionesSectionProps) {
  const [selectedEmpresa, setSelectedEmpresa] = React.useState<string>("");
  const { data, loading, error, refresh } = useDirecciones(selectedEmpresa || undefined);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editDireccion, setEditDireccion] = React.useState<Direccion | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Direccion | null>(null);

  const empresaSeleccionada = empresas.find((e) => e.rut_empresa === selectedEmpresa);

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

  async function handleCreateSuccess() {
    refresh();
    setSheetOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Direcciones</h3>
          <p className="text-muted-foreground text-sm">
            {empresaSeleccionada
              ? `Lugares de atención de ${empresaSeleccionada.nombre}`
              : "Selecciona una empresa para gestionar sus direcciones"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-72">
          <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar empresa..." />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((emp) => (
                <SelectItem key={emp.rut_empresa} value={emp.rut_empresa}>
                  {emp.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmpresa && (
          <Button
            onClick={() => {
              setEditDireccion(null);
              setSheetOpen(true);
            }}
          >
            <Plus />
            Nueva Dirección
          </Button>
        )}
      </div>

      {selectedEmpresa ? (
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
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground text-sm">
          Selecciona una empresa para ver sus direcciones
        </div>
      )}

      <DireccionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        direccion={editDireccion}
        rutEmpresa={selectedEmpresa || undefined}
        onSuccess={handleCreateSuccess}
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
