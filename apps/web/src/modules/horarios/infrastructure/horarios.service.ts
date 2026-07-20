import type { ActualizarHorarioData, HorarioFormData } from "../domain/horario.schema";
import type { Horario } from "../domain/horario.entity";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchHorarios(): Promise<Horario[]> {
  const res = await apiFetch("/api/horarios");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createHorario(dto: HorarioFormData): Promise<Horario> {
  const res = await apiFetch("/api/horarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function updateHorario(id: number, dto: ActualizarHorarioData): Promise<Horario> {
  const res = await apiFetch("/api/horarios", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function deleteHorario(id: number): Promise<void> {
  const res = await apiFetch(`/api/horarios?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
