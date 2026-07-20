import type { ActualizarCitaData, CrearCitaFormData } from "../domain/agenda.schema";
import type { AgendaCita, HorarioSlot, ResumenMes, TipoHora } from "../domain/agenda.entity";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchCitasDelDia(fecha: string): Promise<AgendaCita[]> {
  const res = await apiFetch(`/api/agenda?fecha=${encodeURIComponent(fecha)}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function fetchResumenMes(mes: string): Promise<ResumenMes[]> {
  const res = await apiFetch(`/api/agenda?mes=${encodeURIComponent(mes)}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createCita(dto: CrearCitaFormData): Promise<AgendaCita> {
  const { fecha, hora, ...rest } = dto;
  const fecha_hora = new Date(`${fecha}T${hora}:00`).toISOString();

  const res = await apiFetch("/api/agenda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...rest, fecha_hora }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function updateCita(id: number, dto: ActualizarCitaData): Promise<AgendaCita> {
  const { fecha, hora, ...rest } = dto;
  const body: Record<string, unknown> = { id, ...rest };

  if (fecha && hora) {
    body.fecha_hora = new Date(`${fecha}T${hora}:00`).toISOString();
  } else if (fecha) {
    body.fecha_hora = new Date(`${fecha}T00:00:00`).toISOString();
  }

  const res = await apiFetch("/api/agenda", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function deleteCita(id: number): Promise<void> {
  const res = await apiFetch(`/api/agenda?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

export async function fetchTipos(): Promise<TipoHora[]> {
  const res = await apiFetch("/api/tipos-horas");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function fetchHorarios(): Promise<HorarioSlot[]> {
  const res = await apiFetch("/api/horarios");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function fetchPrevisiones(): Promise<{ id: number; nombre: string }[]> {
  const res = await apiFetch("/api/previsiones");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function buscarPaciente(rut: string): Promise<Record<string, unknown> | null> {
  const res = await apiFetch(`/api/pacientes?rut=${encodeURIComponent(rut)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? null;
}

export async function crearPacienteInline(
  datos: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await apiFetch("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}
