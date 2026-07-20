import type { ActualizarEmpresaData, EmpresaFormData } from "../domain/empresa.schema";
import type { Empresa } from "../domain/empresa.entity";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchEmpresas(): Promise<Empresa[]> {
  const res = await apiFetch("/api/empresas");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createEmpresa(dto: EmpresaFormData): Promise<Empresa> {
  const res = await apiFetch("/api/empresas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function updateEmpresa(rut_empresa: string, dto: ActualizarEmpresaData): Promise<Empresa> {
  const res = await apiFetch("/api/empresas", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut_empresa, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function deleteEmpresa(rut_empresa: string): Promise<void> {
  const res = await apiFetch(`/api/empresas?rut_empresa=${encodeURIComponent(rut_empresa)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
