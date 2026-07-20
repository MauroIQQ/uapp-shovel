// Hook que fetchea datos desde la API
// Sigue el patron de useServerComments para ServerDataTable

"use client";

import * as React from "react";

import type { ExampleEntity } from "../domain/example.entity";

interface UseBuscarEjemplosProps {
  pageSize?: number;
}

interface UseBuscarEjemplosReturn {
  data: ExampleEntity[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBuscarEjemplos({
  pageSize = 20,
}: UseBuscarEjemplosProps = {}): UseBuscarEjemplosReturn {
  const [data, setData] = React.useState<ExampleEntity[]>([]);
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
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/comments?_page=1&_limit=${pageSize}`,
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        // Mapea la respuesta al schema de ExampleEntity
        const raw: Array<{
          id: number;
          name: string;
          email: string;
        }> = await res.json();

        if (!cancelled) {
          setData(
            raw.map((item) => ({
              id: String(item.id),
              nombre: item.name,
              email: item.email,
              estado: "activo" as const,
              createdAt: new Date(),
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar datos",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [pageSize, refetchKey]);

  return { data, loading, error, refresh };
}
