"use client";

import * as React from "react";

import type { KardexArticulo } from "../domain/kardex.entity";
import { fetchArticulos } from "../infrastructure/kardex.service";

interface UseBuscarArticulosReturn {
  data: KardexArticulo[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarArticulos(): UseBuscarArticulosReturn {
  const [data, setData] = React.useState<KardexArticulo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refetchKey, setRefetchKey] = React.useState(0);

  const refresh = React.useCallback(() => setRefetchKey((k) => k + 1), []);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchArticulos();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar artículos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [refetchKey]);

  return { data, loading, error, refresh };
}
