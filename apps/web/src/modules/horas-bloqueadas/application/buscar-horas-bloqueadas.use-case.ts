"use client";

import * as React from "react";

import type { HoraBloqueada } from "../domain/hora-bloqueada.entity";
import { fetchHorasBloqueadas } from "../infrastructure/horas-bloqueadas.service";

interface UseBuscarHorasBloqueadasReturn {
  data: HoraBloqueada[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarHorasBloqueadas(): UseBuscarHorasBloqueadasReturn {
  const [data, setData] = React.useState<HoraBloqueada[]>([]);
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
        const result = await fetchHorasBloqueadas();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar horas bloqueadas");
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
