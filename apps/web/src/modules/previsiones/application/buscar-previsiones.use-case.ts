"use client";

import * as React from "react";

import type { Prevision } from "../domain/prevision.entity";
import { fetchPrevisiones } from "../infrastructure/previsiones.service";

interface UseBuscarPrevisionesReturn {
  data: Prevision[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarPrevisiones(): UseBuscarPrevisionesReturn {
  const [data, setData] = React.useState<Prevision[]>([]);
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
        const result = await fetchPrevisiones();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar previsiones");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [refetchKey]);

  return { data, loading, error, refresh };
}
