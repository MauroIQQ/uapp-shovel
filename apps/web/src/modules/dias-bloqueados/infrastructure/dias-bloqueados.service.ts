import type { DiaBloqueadoFormData } from "../domain/dia-bloqueado.schema";
import type { DiaBloqueado } from "../domain/dia-bloqueado.entity";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchDiasBloqueados(): Promise<DiaBloqueado[]> {
  const res = await apiFetch("/api/dias-bloqueados");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data ?? [];
}

export async function createDiaBloqueado(dto: DiaBloqueadoFormData): Promise<DiaBloqueado> {
  const res = await apiFetch("/api/dias-bloqueados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function deleteDiaBloqueado(fecha: string): Promise<void> {
  const res = await apiFetch(`/api/dias-bloqueados?fecha=${encodeURIComponent(fecha)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
