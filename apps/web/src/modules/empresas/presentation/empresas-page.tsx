"use client";

import * as React from "react";
import { Building2, Plus } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useBuscarEmpresas } from "../application/buscar-empresas.use-case";
import { useEmpresasColumns } from "./empresas-columns";
import { EmpresaFormSheet } from "./empresa-form-sheet";
import { deleteEmpresa } from "../infrastructure/empresas.service";
import type { Empresa } from "../domain/empresa.entity";

export function EmpresasPage() {
  const { data, loading, error, refresh } = useBuscarEmpresas();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editEmpresa, setEditEmpresa] = React.useState<Empresa | null>(null);
  const [deleteEmpresaData, setDeleteEmpresaData] = React.useState<Empresa | null>(null);

  const [filtroEstado, setFiltroEstado] = React.useState<string>("");

  const filteredData = React.useMemo(() => {
    if (!filtroEstado) return data;
    return data.filter((e) => e.estado === filtroEstado);
  }, [data, filtroEstado]);

  const columns = useEmpresasColumns({
    onEdit: (e) => {
      setEditEmpresa(e);
      setSheetOpen(true);
    },
    onDelete: (e) => setDeleteEmpresaData(e),
  });

  const filterBar = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Building2 />
          {filtroEstado
            ? filtroEstado === "activo" ? "Activo" : "Inactivo"
            : "Estado"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40">
        <DropdownMenuItem onClick={() => setFiltroEstado("")}>Todas</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFiltroEstado("activo")}>Activo</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFiltroEstado("inactivo")}>Inactivo</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  async function handleDeleteConfirm() {
    if (!deleteEmpresaData) return;
    try {
      await deleteEmpresa(deleteEmpresaData.rut_empresa);
      refresh();
    } catch {
      // error handled silently
    } finally {
      setDeleteEmpresaData(null);
    }
  }

  function handleCreate() {
    setEditEmpresa(null);
    setSheetOpen(true);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de empresas del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> Nueva Empresa
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="rut_empresa"
        searchPlaceholder="Filtrar por RUT empresa"
        filterBar={filterBar}
        hideColumnsButton
      />

      <EmpresaFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        empresa={editEmpresa}
        onSuccess={refresh}
      />

      <AlertDialog
        open={!!deleteEmpresaData}
        onOpenChange={(open) => { if (!open) setDeleteEmpresaData(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la empresa{" "}
              <strong>{deleteEmpresaData?.rut_empresa}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
