import type {
  ActualizarCategoriaData,
  ActualizarSubcategoriaData,
  CrearCategoriaData,
  CrearSubcategoriaData,
} from "../domain/documento-categoria.schema";
import type { CategoriaConSubcategorias, SubcategoriaDocumento } from "../domain/documento-categoria.entity";
import { apiFetch } from "@/lib/api-fetch";

const API = "/api/configuracion/categorias-documentos";
const API_SUB = "/api/configuracion/subcategorias";

export async function fetchCategorias(): Promise<CategoriaConSubcategorias[]> {
  const res = await apiFetch(API);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearCategoria(dto: CrearCategoriaData): Promise<CategoriaConSubcategorias> {
  const res = await apiFetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarCategoria(id: number, dto: ActualizarCategoriaData): Promise<CategoriaConSubcategorias> {
  const res = await apiFetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  const res = await apiFetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

export async function crearSubcategoria(idCategoria: number, dto: CrearSubcategoriaData): Promise<SubcategoriaDocumento> {
  const res = await apiFetch(`${API}/${idCategoria}/subcategorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarSubcategoria(id: number, dto: ActualizarSubcategoriaData): Promise<SubcategoriaDocumento> {
  const res = await apiFetch(`${API_SUB}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarSubcategoria(id: number): Promise<void> {
  const res = await apiFetch(`${API_SUB}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
