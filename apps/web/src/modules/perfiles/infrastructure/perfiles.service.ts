import { apiFetch } from "@/lib/api-fetch";
import type { Permiso } from "../domain/perfil.entity";

export async function fetchPermisos(rut_empresa: string): Promise<Permiso[]> {
  const res = await apiFetch(`/api/permisos?rut_empresa=${encodeURIComponent(rut_empresa)}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function updatePermisos(
  rut_empresa: string,
  perfil: number,
  items: { id_item: string; nombre: string }[],
): Promise<void> {
  const res = await apiFetch("/api/permisos", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut_empresa, perfil, items }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
