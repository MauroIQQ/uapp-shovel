import { apiFetch } from "@/lib/api-fetch";

import type { Paciente } from "../domain/paciente.entity";
import type { ActualizarPacienteData, PacienteFormData } from "../domain/paciente.schema";

export async function fetchPacientes(): Promise<Paciente[]> {
  const res = await apiFetch("/api/pacientes");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createPaciente(dto: PacienteFormData): Promise<Paciente> {
  const res = await apiFetch("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function updatePaciente(rut: string, dto: ActualizarPacienteData): Promise<Paciente> {
  const res = await apiFetch("/api/pacientes", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function deletePaciente(rut: string): Promise<void> {
  const res = await apiFetch(`/api/pacientes?rut=${encodeURIComponent(rut)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

export async function fetchPrevisiones(): Promise<{ id: number; nombre: string }[]> {
  const res = await apiFetch("/api/previsiones");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}
