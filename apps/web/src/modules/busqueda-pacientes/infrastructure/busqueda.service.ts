import { apiFetch } from "@/lib/api-fetch";

import type { PacienteBusqueda } from "../domain/busqueda.entity";

export async function buscarPacientes(q: string): Promise<PacienteBusqueda[]> {
  const res = await apiFetch(`/api/busqueda-pacientes?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}
