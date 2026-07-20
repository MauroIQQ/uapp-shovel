"use client";

import * as React from "react";

import type { TipoAtencion } from "../domain/tipo-atencion.entity";
import { fetchTiposAtencion } from "../infrastructure/tipos-atencion.service";

interface UseBuscarTiposAtencionReturn {
  data: TipoAtencion[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarTiposAtencion(): UseBuscarTiposAtencionReturn {
  const [data, setData] = React.useState<TipoAtencion[]>([]);
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
        const result = await fetchTiposAtencion();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar tipos de atención");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, refresh };
}
