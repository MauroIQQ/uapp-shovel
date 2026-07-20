import { apiFetch } from "@/lib/api-fetch";

import type { TipoAtencion } from "../domain/tipo-atencion.entity";
import type { ActualizarTipoAtencionData, TipoAtencionFormData } from "../domain/tipo-atencion.schema";

export async function fetchTiposAtencion(): Promise<TipoAtencion[]> {
  const res = await apiFetch("/api/tipos-horas");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createTipoAtencion(dto: TipoAtencionFormData): Promise<TipoAtencion> {
  const res = await apiFetch("/api/tipos-horas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function updateTipoAtencion(id: number, dto: ActualizarTipoAtencionData): Promise<TipoAtencion> {
  const res = await apiFetch("/api/tipos-horas", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function deleteTipoAtencion(id: number): Promise<void> {
  const res = await apiFetch(`/api/tipos-horas?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
