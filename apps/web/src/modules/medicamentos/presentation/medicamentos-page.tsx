"use client";

import * as React from "react";

import { Pill, Plus } from "lucide-react";

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

import { useBuscarMedicamentos } from "../application/buscar-medicamentos.use-case";
import type { CategoriaMedicamento, Medicamento } from "../domain/medicamento.entity";
import { deleteMedicamento, fetchCategorias } from "../infrastructure/medicamentos.service";
import { MedicamentoFormSheet } from "./medicamento-form-sheet";
import { useMedicamentosColumns } from "./medicamentos-columns";

export function MedicamentosPage() {
  const { data, loading, error, refresh } = useBuscarMedicamentos();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editMedicamento, setEditMedicamento] = React.useState<Medicamento | null>(null);
  const [deleteData, setDeleteData] = React.useState<Medicamento | null>(null);

  const [categorias, setCategorias] = React.useState<CategoriaMedicamento[]>([]);
  const [filtroCategoria, setFiltroCategoria] = React.useState<string>("");

  React.useEffect(() => {
    fetchCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  const filteredData = React.useMemo(() => {
    if (!filtroCategoria) return data;
    return data.filter((m) => m.id_categoria === Number(filtroCategoria));
  }, [data, filtroCategoria]);

  const columns = useMedicamentosColumns({
    onEdit: (m) => {
      setEditMedicamento(m);
      setSheetOpen(true);
    },
    onDelete: (m) => setDeleteData(m),
  });

  const filterBar = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Pill />
          {filtroCategoria ? categorias.find((c) => c.id === Number(filtroCategoria))?.nombre : "Categoría"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuItem onClick={() => setFiltroCategoria("")}>Todas</DropdownMenuItem>
        {categorias.map((cat) => (
          <DropdownMenuItem key={cat.id} onClick={() => setFiltroCategoria(String(cat.id))}>
            {cat.nombre}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  async function handleDeleteConfirm() {
    if (!deleteData) return;
    try {
      await deleteMedicamento(deleteData.id);
      refresh();
    } catch {
      // silent
    } finally {
      setDeleteData(null);
    }
  }

  function handleCreate() {
    setEditMedicamento(null);
    setSheetOpen(true);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Medicamentos</h1>
          <p className="mt-1 text-muted-foreground text-sm">Catálogo de medicamentos del centro médico</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> Nuevo Medicamento
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="nombre"
        searchPlaceholder="Filtrar por nombre"
        filterBar={filterBar}
        hideColumnsButton
      />

      <MedicamentoFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        medicamento={editMedicamento}
        onSuccess={refresh}
      />

      <AlertDialog
        open={!!deleteData}
        onOpenChange={(open) => {
          if (!open) setDeleteData(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar medicamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará <strong>{deleteData?.nombre}</strong>.
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
