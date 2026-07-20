// Pagina de ejemplo usando ServerDataTable + hook useBuscarEjemplos
// Este es el patron base para todos los CRUD del sistema

"use client";

import { ServerDataTable } from "@/app/(main)/dashboard/componentes/datatable/_components/server-data-table";

import { useBuscarEjemplos } from "../application/buscar-ejemplos.use-case";
import { ejemploColumns } from "./ejemplo-columns";

export function EjemploPage() {
  const { data, loading, error, refresh } = useBuscarEjemplos();

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Modulo Example</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Template DDD: usa ServerDataTable + hook useBuscarEjemplos.
        Reemplazar con datos reales del dominio.
      </p>

      <ServerDataTable
        columns={ejemploColumns}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        searchColumn="nombre"
      />
    </div>
  );
}
