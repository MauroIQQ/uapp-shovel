"use client";

import * as React from "react";

import type { Paciente } from "../domain/paciente.entity";
import { fetchPacientes } from "../infrastructure/pacientes.service";

interface UseBuscarPacientesReturn {
  data: Paciente[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarPacientes(): UseBuscarPacientesReturn {
  const [data, setData] = React.useState<Paciente[]>([]);
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
        const result = await fetchPacientes();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar pacientes");
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
