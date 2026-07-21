import { apiFetch } from "@/lib/api-fetch";

import type { HoraBloqueada } from "../domain/hora-bloqueada.entity";

export async function fetchHorasBloqueadas(fecha?: string): Promise<HoraBloqueada[]> {
  const params = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
  const res = await apiFetch(`/api/horas-bloqueadas${params}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createHoraBloqueada(fecha: string, hora: string, motivo?: string | null): Promise<HoraBloqueada> {
  const res = await apiFetch("/api/horas-bloqueadas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fecha, hora, motivo }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function createHorasBloqueadas(
  fecha: string,
  horas: string[],
  motivo?: string | null,
): Promise<HoraBloqueada[]> {
  return Promise.all(horas.map((hora) => createHoraBloqueada(fecha, hora, motivo)));
}

export async function deleteHoraBloqueada(id: number): Promise<void> {
  const res = await apiFetch(`/api/horas-bloqueadas?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
