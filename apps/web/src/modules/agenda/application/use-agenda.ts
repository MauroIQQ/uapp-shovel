"use client";

import * as React from "react";

import type { AgendaCita, ResumenMes } from "../domain/agenda.entity";
import { fetchCitasDelDia } from "../infrastructure/agenda.service";

interface UseAgendaReturn {
  citas: AgendaCita[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAgenda(fecha: string): UseAgendaReturn {
  const [citas, setCitas] = React.useState<AgendaCita[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refetchKey, setRefetchKey] = React.useState(0);

  const refresh = React.useCallback(() => setRefetchKey((k) => k + 1), []);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!fecha) return;
      setLoading(true);
      setError(null);

      try {
        const result = await fetchCitasDelDia(fecha);
        if (!cancelled) setCitas(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar agenda");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [fecha, refetchKey]);

  return { citas, loading, error, refresh };
}

interface UseResumenMesReturn {
  resumen: ResumenMes[];
  loading: boolean;
}

export function useResumenMes(mes: string): UseResumenMesReturn {
  const [resumen, setResumen] = React.useState<ResumenMes[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!mes) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/agenda/mes?mes=${encodeURIComponent(mes)}`);
        const json = await res.json();
        if (!cancelled) setResumen(json.data ?? []);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [mes]);

  return { resumen, loading };
}
