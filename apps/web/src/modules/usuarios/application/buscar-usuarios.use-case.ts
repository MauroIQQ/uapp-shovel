"use client";

import * as React from "react";

import type { Usuario } from "../domain/usuario.entity";
import { fetchUsuarios } from "../infrastructure/usuarios.service";

interface UseBuscarUsuariosReturn {
  data: Usuario[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarUsuarios(): UseBuscarUsuariosReturn {
  const [data, setData] = React.useState<Usuario[]>([]);
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
        const result = await fetchUsuarios();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar usuarios");
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
