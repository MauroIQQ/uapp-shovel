"use client";

import * as React from "react";

import type { Medicamento } from "../domain/medicamento.entity";
import { fetchMedicamentos } from "../infrastructure/medicamentos.service";

interface UseBuscarMedicamentosReturn {
  data: Medicamento[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

let cachedData: Medicamento[] | null = null;

export function useBuscarMedicamentos(): UseBuscarMedicamentosReturn {
  const [data, setData] = React.useState<Medicamento[]>(cachedData ?? []);
  const [loading, setLoading] = React.useState(!cachedData);
  const [error, setError] = React.useState<string | null>(null);
  const [refetchKey, setRefetchKey] = React.useState(0);

  const refresh = React.useCallback(() => {
    cachedData = null;
    setRefetchKey((k) => k + 1);
  }, []);

  React.useEffect(() => {
    if (cachedData) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMedicamentos();
        if (!cancelled) {
          cachedData = result;
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar medicamentos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [refetchKey]);

  return { data, loading, error, refresh };
}
