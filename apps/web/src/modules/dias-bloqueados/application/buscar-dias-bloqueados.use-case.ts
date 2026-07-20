"use client";

import * as React from "react";

import type { DiaBloqueado } from "../domain/dia-bloqueado.entity";
import { fetchDiasBloqueados } from "../infrastructure/dias-bloqueados.service";

interface UseBuscarDiasBloqueadosReturn {
  data: DiaBloqueado[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarDiasBloqueados(): UseBuscarDiasBloqueadosReturn {
  const [data, setData] = React.useState<DiaBloqueado[]>([]);
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
        const result = await fetchDiasBloqueados();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar días bloqueados");
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
