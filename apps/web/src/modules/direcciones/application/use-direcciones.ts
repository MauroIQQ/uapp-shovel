"use client";

import * as React from "react";

import type { Direccion } from "../domain/direccion.entity";
import { fetchDirecciones } from "../infrastructure/direcciones.service";

interface UseDireccionesReturn {
  data: Direccion[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDirecciones(rutEmpresa?: string): UseDireccionesReturn {
  const [data, setData] = React.useState<Direccion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [_refetchKey, setRefetchKey] = React.useState(0);

  const refresh = React.useCallback(() => setRefetchKey((k) => k + 1), []);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDirecciones(rutEmpresa);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar direcciones");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [_refetchKey, rutEmpresa]);

  return { data, loading, error, refresh };
}
