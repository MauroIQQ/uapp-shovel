"use client";

import * as React from "react";

import type { Empresa } from "../domain/empresa.entity";
import { fetchEmpresas } from "../infrastructure/empresas.service";

interface UseBuscarEmpresasReturn {
  data: Empresa[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarEmpresas(): UseBuscarEmpresasReturn {
  const [data, setData] = React.useState<Empresa[]>([]);
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
        const result = await fetchEmpresas();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar empresas");
        }
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
