"use client";

import * as React from "react";

import type { Horario } from "../domain/horario.entity";
import { fetchHorarios } from "../infrastructure/horarios.service";

interface UseBuscarHorariosReturn {
  data: Horario[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarHorarios(): UseBuscarHorariosReturn {
  const [data, setData] = React.useState<Horario[]>([]);
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
        const result = await fetchHorarios();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar horarios");
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
