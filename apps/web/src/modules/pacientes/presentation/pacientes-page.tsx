"use client";

import * as React from "react";

import { ArrowUpDown, Globe, ListFilter, Plus } from "lucide-react";

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

import { useBuscarPacientes } from "../application/buscar-pacientes.use-case";
import { calcularEdad, type Paciente } from "../domain/paciente.entity";
import { deletePaciente, fetchPrevisiones } from "../infrastructure/pacientes.service";
import { PacienteFormSheet } from "./paciente-form-sheet";
import { usePacientesColumns } from "./pacientes-columns";

export function PacientesPage() {
  const { data, loading, error, refresh } = useBuscarPacientes();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editPaciente, setEditPaciente] = React.useState<Paciente | null>(null);
  const [deletePacienteData, setDeletePacienteData] = React.useState<Paciente | null>(null);

  const [previsiones, setPrevisiones] = React.useState<{ id: number; nombre: string }[]>([]);

  const [filtroPrevision, setFiltroPrevision] = React.useState<string>("");
  const [filtroExtranjero, setFiltroExtranjero] = React.useState("todos");
  const [ordenar, setOrdenar] = React.useState("nombre");

  React.useEffect(() => {
    fetchPrevisiones()
      .then(setPrevisiones)
      .catch(() => {});
  }, []);

  const filteredData = React.useMemo(() => {
    let result = data;

    if (filtroPrevision) {
      const id = Number(filtroPrevision);
      result = result.filter((p) => p.id_prevision === id);
    }

    if (filtroExtranjero === "extranjero") {
      result = result.filter((p) => p.extranjero === true);
    } else if (filtroExtranjero === "nacional") {
      result = result.filter((p) => p.extranjero === false || p.extranjero === null);
    }

    if (ordenar === "edad") {
      result = [...result].sort(
        (a, b) => (calcularEdad(b.fecha_nacimiento) ?? 0) - (calcularEdad(a.fecha_nacimiento) ?? 0),
      );
    }

    return result;
  }, [data, filtroPrevision, filtroExtranjero, ordenar]);

  const columns = usePacientesColumns({
    onEdit: (p) => {
      setEditPaciente(p);
      setSheetOpen(true);
    },
    onDelete: (p) => setDeletePacienteData(p),
  });

  const filterBar = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ListFilter />
            {filtroPrevision ? previsiones.find((p) => p.id === Number(filtroPrevision))?.nombre : "Previsión"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56">
          <DropdownMenuItem onClick={() => setFiltroPrevision("")}>Todas</DropdownMenuItem>
          {previsiones.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => setFiltroPrevision(String(p.id))}>
              {p.nombre}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Globe />
            {filtroExtranjero === "todos"
              ? "Extranjero"
              : filtroExtranjero === "extranjero"
                ? "Extranjero"
                : "Nacional"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setFiltroExtranjero("todos")}>Todos</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFiltroExtranjero("extranjero")}>Extranjero</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFiltroExtranjero("nacional")}>Nacional</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpDown />
            {ordenar === "nombre" ? "Nombre" : "Edad"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOrdenar("nombre")}>Nombre</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOrdenar("edad")}>Edad</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  async function handleDeleteConfirm() {
    if (!deletePacienteData) return;
    try {
      await deletePaciente(deletePacienteData.rut);
      refresh();
    } catch {
      // error handled silently
    } finally {
      setDeletePacienteData(null);
    }
  }

  function handleCreate() {
    setEditPaciente(null);
    setSheetOpen(true);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Pacientes</h1>
          <p className="mt-1 text-muted-foreground text-sm">Gestión de pacientes del centro médico</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> Nuevo Paciente
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="nombre_completo"
        searchPlaceholder="Filtrar por nombre de paciente"
        filterBar={filterBar}
        hideColumnsButton
      />

      <PacienteFormSheet open={sheetOpen} onOpenChange={setSheetOpen} paciente={editPaciente} onSuccess={refresh} />

      <AlertDialog
        open={!!deletePacienteData}
        onOpenChange={(open) => {
          if (!open) setDeletePacienteData(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará a <strong>{deletePacienteData?.nombre_completo}</strong> (
              {deletePacienteData?.rut}).
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
