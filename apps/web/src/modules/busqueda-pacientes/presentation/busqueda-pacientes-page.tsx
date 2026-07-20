"use client";

import * as React from "react";

import { Search } from "lucide-react";

import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useBusquedaPacientes } from "../application/buscar-pacientes.use-case";
import { busquedaColumns } from "./busqueda-pacientes-columns";

export function BusquedaPacientesPage() {
  const { query, setQuery, results, loading, error, search } = useBusquedaPacientes();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") search();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl tracking-tight">Búsqueda de Pacientes</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Busque pacientes por RUT o nombre. Solo se muestran pacientes con citas agendadas.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="RUT o nombre del paciente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button onClick={search} disabled={loading || query.trim().length < 2}>
          Buscar
        </Button>
      </div>

      <ServerDataTable
        columns={busquedaColumns}
        data={results}
        loading={loading}
        error={error}
        onRefresh={search}
        searchColumn="nombre_completo"
        searchPlaceholder="Filtrar resultados..."
      />
    </div>
  );
}
