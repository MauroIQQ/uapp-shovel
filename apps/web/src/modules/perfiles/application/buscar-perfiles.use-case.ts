"use client";

import * as React from "react";

import type { Permiso, PermisoState } from "../domain/perfil.entity";
import { SISTEMA_MODULOS } from "../domain/perfil.entity";
import { fetchPermisos } from "../infrastructure/perfiles.service";

interface UseBuscarPermisosReturn {
  permisos: Permiso[];
  getPermisosState: (perfil: number) => PermisoState[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarPermisos(rut_empresa: string): UseBuscarPermisosReturn {
  const [permisos, setPermisos] = React.useState<Permiso[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refetchKey, setRefetchKey] = React.useState(0);

  const refresh = React.useCallback(() => setRefetchKey((k) => k + 1), []);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!rut_empresa) return;
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPermisos(rut_empresa);
        if (!cancelled) setPermisos(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar permisos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [rut_empresa, refetchKey]);

  const getPermisosState = React.useCallback(
    (perfil: number): PermisoState[] => {
      const perfilPermisos = permisos.filter((p) => p.perfil === perfil);
      const idSet = new Set(perfilPermisos.map((p) => p.id_item));
      return SISTEMA_MODULOS.map((mod) => ({
        id_item: mod.id_item,
        nombre: mod.nombre,
        checked: idSet.has(mod.id_item),
      }));
    },
    [permisos],
  );

  return { permisos, getPermisosState, loading, error, refresh };
}
