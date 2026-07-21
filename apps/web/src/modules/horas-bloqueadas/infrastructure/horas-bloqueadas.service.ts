import { apiFetch } from "@/lib/api-fetch";

import type { HoraBloqueada } from "../domain/hora-bloqueada.entity";
import type { HoraBloqueadaFormData } from "../domain/hora-bloqueada.schema";

export async function fetchHorasBloqueadas(fecha?: string): Promise<HoraBloqueada[]> {
  const params = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
  const res = await apiFetch(`/api/horas-bloqueadas${params}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createHoraBloqueada(dto: HoraBloqueadaFormData): Promise<HoraBloqueada> {
  const res = await apiFetch("/api/horas-bloqueadas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function deleteHoraBloqueada(id: number): Promise<void> {
  const res = await apiFetch(`/api/horas-bloqueadas?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
