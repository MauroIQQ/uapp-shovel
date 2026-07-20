"use client";

import * as React from "react";

import type { PacienteBusqueda } from "../domain/busqueda.entity";
import { buscarPacientes } from "../infrastructure/busqueda.service";

interface UseBusquedaPacientesReturn {
  query: string;
  setQuery: (q: string) => void;
  results: PacienteBusqueda[];
  loading: boolean;
  error: string | null;
  search: () => void;
}

export function useBusquedaPacientes(): UseBusquedaPacientesReturn {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<PacienteBusqueda[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const search = React.useCallback(async () => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await buscarPacientes(query.trim());
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar pacientes");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return { query, setQuery, results, loading, error, search };
}
