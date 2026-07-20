"use client";

import * as React from "react";
import { Lock, ShieldCheck, ShieldHalf, ShieldX } from "lucide-react";

import { Perfil, PERFIL_NOMBRES, PERFIL_ORDEN } from "@uapp/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Empresa } from "@/modules/empresas/domain/empresa.entity";
import { fetchEmpresas } from "@/modules/empresas/infrastructure/empresas.service";

import { useBuscarPermisos } from "../application/buscar-perfiles.use-case";
import { SISTEMA_MODULOS } from "../domain/perfil.entity";
import { PerfilPermisosSheet } from "./perfil-permisos-sheet";

const PERFIL_ICONOS: Record<number, React.ElementType> = {
  1: ShieldX,
  3: ShieldHalf,
  2: ShieldCheck,
};

const PERFIL_COLORS: Record<number, string> = {
  1: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20",
  3: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20",
  2: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20",
};

const PERFIL_BADGE_COLORS: Record<number, string> = {
  1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  3: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  2: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function PerfilesPage() {
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [rutEmpresa, setRutEmpresa] = React.useState("76140290-0");
  const [editPerfil, setEditPerfil] = React.useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  React.useEffect(() => {
    fetchEmpresas()
      .then((list) => {
        setEmpresas(list);
        if (list.length > 0 && !list.find((e) => e.rut_empresa === rutEmpresa)) {
          setRutEmpresa(list[0].rut_empresa);
        }
      })
      .catch(() => {});
  }, []);

  const { getPermisosState, loading, refresh } = useBuscarPermisos(rutEmpresa);

  const empSelect = rutEmpresa
    ? empresas.find((e) => e.rut_empresa === rutEmpresa)
    : null;

  function handleEdit(perfil: number) {
    setEditPerfil(perfil);
    setSheetOpen(true);
  }

  const currentItems = editPerfil !== null ? getPermisosState(editPerfil) : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfiles de Acceso</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de permisos por perfil y empresa
          </p>
        </div>
      </div>

      <div className="mb-6 max-w-xs">
        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Empresa
        </label>
        <Select value={rutEmpresa} onValueChange={setRutEmpresa}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar empresa..." />
          </SelectTrigger>
          <SelectContent>
            {empresas
              .filter((e) => e.estado === "activo")
              .map((e) => (
                <SelectItem key={e.rut_empresa} value={e.rut_empresa}>
                  {e.rut_empresa} {e.giro ? `– ${e.giro}` : ""}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Cargando permisos...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERFIL_ORDEN.filter((p) => p !== Perfil.Root).map((perfil) => {
            const state = getPermisosState(perfil);
            const enabledCount = state.filter((s) => s.checked).length;
            const totalCount = SISTEMA_MODULOS.length;
            const Icon = PERFIL_ICONOS[perfil] ?? Lock;

            return (
              <div
                key={perfil}
                className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${PERFIL_COLORS[perfil] ?? ""}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-background shadow-sm">
                    <Icon className="size-5 text-muted-foreground" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">
                      {PERFIL_NOMBRES[perfil as Perfil]}
                    </h3>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PERFIL_BADGE_COLORS[perfil] ?? ""}`}
                    >
                      {enabledCount}/{totalCount} módulos
                    </span>
                  </div>
                </div>

                <div className="mb-4 space-y-1">
                  {state
                    .filter((s) => s.checked)
                    .slice(0, 4)
                    .map((s) => (
                      <span
                        key={s.id_item}
                        className="inline-block mr-1 mb-1 rounded bg-background/80 px-2 py-0.5 text-xs text-muted-foreground border"
                      >
                        {s.nombre}
                      </span>
                    ))}
                  {enabledCount > 4 && (
                    <span className="inline-block text-xs text-muted-foreground">
                      +{enabledCount - 4} más
                    </span>
                  )}
                  {enabledCount === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      Sin permisos asignados
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleEdit(perfil)}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Editar permisos
                </button>
              </div>
            );
          })}
        </div>
      )}

      <PerfilPermisosSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        rut_empresa={rutEmpresa}
        perfil={editPerfil ?? 0}
        perfilNombre={
          editPerfil !== null ? PERFIL_NOMBRES[editPerfil as Perfil] ?? "" : ""
        }
        initialItems={currentItems}
        onSuccess={refresh}
      />
    </div>
  );
}
