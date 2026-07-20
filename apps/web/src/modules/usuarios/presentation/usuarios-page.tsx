"use client";

import * as React from "react";

import { PERFIL_NOMBRES, type Perfil } from "@uapp/shared";
import { Plus, UserCog } from "lucide-react";

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

import { useBuscarUsuarios } from "../application/buscar-usuarios.use-case";
import { nombreCompleto, type Usuario } from "../domain/usuario.entity";
import { deleteUsuario } from "../infrastructure/usuarios.service";
import { UsuarioFormSheet } from "./usuario-form-sheet";
import { useUsuariosColumns } from "./usuarios-columns";

export function UsuariosPage() {
  const { data, loading, error, refresh } = useBuscarUsuarios();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editUsuario, setEditUsuario] = React.useState<Usuario | null>(null);
  const [deleteUsuarioData, setDeleteUsuarioData] = React.useState<Usuario | null>(null);

  const [filtroPerfil, setFiltroPerfil] = React.useState<string>("");

  const filteredData = React.useMemo(() => {
    if (!filtroPerfil) return data;
    return data.filter((u) => u.perfil === Number(filtroPerfil));
  }, [data, filtroPerfil]);

  const columns = useUsuariosColumns({
    onEdit: (u) => {
      setEditUsuario(u);
      setSheetOpen(true);
    },
    onDelete: (u) => setDeleteUsuarioData(u),
  });

  const filterBar = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCog />
          {filtroPerfil ? PERFIL_NOMBRES[Number(filtroPerfil) as Perfil] : "Perfil"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40">
        <DropdownMenuItem onClick={() => setFiltroPerfil("")}>Todos</DropdownMenuItem>
        {Object.entries(PERFIL_NOMBRES).map(([key, label]) => (
          <DropdownMenuItem key={key} onClick={() => setFiltroPerfil(key)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  async function handleDeleteConfirm() {
    if (!deleteUsuarioData) return;
    try {
      await deleteUsuario(deleteUsuarioData.rut);
      refresh();
    } catch {
      // error handled silently
    } finally {
      setDeleteUsuarioData(null);
    }
  }

  function handleCreate() {
    setEditUsuario(null);
    setSheetOpen(true);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Usuarios</h1>
          <p className="mt-1 text-muted-foreground text-sm">Gestión de usuarios del sistema</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> Nuevo Usuario
        </Button>
      </div>

      <ServerDataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="rut"
        searchPlaceholder="Filtrar por RUT"
        filterBar={filterBar}
        hideColumnsButton
      />

      <UsuarioFormSheet open={sheetOpen} onOpenChange={setSheetOpen} usuario={editUsuario} onSuccess={refresh} />

      <AlertDialog
        open={!!deleteUsuarioData}
        onOpenChange={(open) => {
          if (!open) setDeleteUsuarioData(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará a{" "}
              <strong>{deleteUsuarioData ? nombreCompleto(deleteUsuarioData) : ""}</strong> ({deleteUsuarioData?.rut}).
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
