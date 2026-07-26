"use client";

import * as React from "react";

import { Building2, MapPin, Plus } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DireccionesSection } from "@/modules/direcciones/presentation/direcciones-section";

import { useBuscarEmpresas } from "../application/buscar-empresas.use-case";
import type { Empresa } from "../domain/empresa.entity";
import { deleteEmpresa } from "../infrastructure/empresas.service";
import { EmpresaFormSheet } from "./empresa-form-sheet";
import { useEmpresasColumns } from "./empresas-columns";

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
          {filtroEstado ? (filtroEstado === "activo" ? "Activo" : "Inactivo") : "Estado"}
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
          <h1 className="font-bold text-2xl tracking-tight">Empresas</h1>
          <p className="mt-1 text-muted-foreground text-sm">Gestión de empresas y lugares de atención</p>
        </div>
      </div>

      <Tabs defaultValue="empresas">
        <TabsList className="mb-6">
          <TabsTrigger value="empresas">
            <Building2 className="mr-2 size-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="direcciones">
            <MapPin className="mr-2 size-4" />
            Direcciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresas">
          <div className="mb-6 flex items-center justify-between">
            <div />
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

          <EmpresaFormSheet open={sheetOpen} onOpenChange={setSheetOpen} empresa={editEmpresa} onSuccess={refresh} />

          <AlertDialog
            open={!!deleteEmpresaData}
            onOpenChange={(open) => {
              if (!open) setDeleteEmpresaData(null);
            }}
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
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="direcciones">
          <DireccionesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
