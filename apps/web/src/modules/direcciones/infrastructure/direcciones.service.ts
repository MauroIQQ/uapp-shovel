import { apiFetch } from "@/lib/api-fetch";

import type { Direccion } from "../domain/direccion.entity";
import type { DireccionFormData } from "../domain/direccion.schema";

export async function fetchDirecciones(rutEmpresa?: string): Promise<Direccion[]> {
  const params = rutEmpresa ? `?rut_empresa=${encodeURIComponent(rutEmpresa)}` : "";
  const res = await apiFetch(`/api/direcciones${params}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createDireccion(dto: DireccionFormData & { rut_empresa?: string }): Promise<Direccion> {
  const res = await apiFetch("/api/direcciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function updateDireccion(id: number, dto: DireccionFormData): Promise<Direccion> {
  const res = await apiFetch("/api/direcciones", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function deleteDireccion(id: number): Promise<void> {
  const res = await apiFetch(`/api/direcciones?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
