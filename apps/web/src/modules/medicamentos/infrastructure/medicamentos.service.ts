import type { ActualizarMedicamentoData, MedicamentoFormData } from "../domain/medicamento.schema";
import type { CategoriaMedicamento, Medicamento } from "../domain/medicamento.entity";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchMedicamentos(): Promise<Medicamento[]> {
  const res = await apiFetch("/api/medicamentos");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createMedicamento(dto: MedicamentoFormData): Promise<Medicamento> {
  const res = await apiFetch("/api/medicamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function updateMedicamento(id: number, dto: ActualizarMedicamentoData): Promise<Medicamento> {
  const res = await apiFetch("/api/medicamentos", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function deleteMedicamento(id: number): Promise<void> {
  const res = await apiFetch(`/api/medicamentos?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

export async function fetchCategorias(): Promise<CategoriaMedicamento[]> {
  const res = await apiFetch("/api/categorias-medicamentos");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createCategoria(nombre: string): Promise<CategoriaMedicamento> {
  const res = await apiFetch("/api/categorias-medicamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}
