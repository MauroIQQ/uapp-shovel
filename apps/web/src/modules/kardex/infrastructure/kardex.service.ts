import { apiFetch } from "@/lib/api-fetch";

import type { KardexArticulo } from "../domain/kardex.entity";
import type { ActualizarArticuloData, KardexFormData } from "../domain/kardex.schema";

export async function fetchArticulos(): Promise<KardexArticulo[]> {
  const res = await apiFetch("/api/kardex");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createArticulo(dto: KardexFormData): Promise<KardexArticulo> {
  const res = await apiFetch("/api/kardex", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function updateArticulo(id: number, dto: ActualizarArticuloData): Promise<KardexArticulo> {
  const res = await apiFetch("/api/kardex", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_articulo: id, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function deleteArticulo(id: number): Promise<void> {
  const res = await apiFetch(`/api/kardex?id_articulo=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
