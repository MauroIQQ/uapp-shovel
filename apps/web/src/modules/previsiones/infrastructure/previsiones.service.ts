import { apiFetch } from "@/lib/api-fetch";

import type { Prevision } from "../domain/prevision.entity";
import type { ActualizarPrevisionData, PrevisionFormData } from "../domain/prevision.schema";

export async function fetchPrevisiones(): Promise<Prevision[]> {
  const res = await apiFetch("/api/previsiones");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createPrevision(dto: PrevisionFormData): Promise<Prevision> {
  const res = await apiFetch("/api/previsiones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function updatePrevision(id: number, dto: ActualizarPrevisionData): Promise<Prevision> {
  const res = await apiFetch("/api/previsiones", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function deletePrevision(id: number): Promise<void> {
  const res = await apiFetch(`/api/previsiones?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
