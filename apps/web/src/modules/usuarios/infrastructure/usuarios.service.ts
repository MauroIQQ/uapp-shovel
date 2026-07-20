import type { ActualizarUsuarioData, UsuarioFormData } from "../domain/usuario.schema";
import type { Usuario } from "../domain/usuario.entity";
import { apiFetch } from "@/lib/api-fetch";

export async function fetchUsuarios(): Promise<Usuario[]> {
  const res = await apiFetch("/api/usuarios");
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data ?? [];
}

export async function createUsuario(dto: UsuarioFormData): Promise<Usuario> {
  const res = await apiFetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function updateUsuario(rut: string, dto: ActualizarUsuarioData): Promise<Usuario> {
  const res = await apiFetch("/api/usuarios", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut, ...dto }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const result = await res.json();
  return result.data;
}

export async function deleteUsuario(rut: string): Promise<void> {
  const res = await apiFetch(`/api/usuarios?rut=${encodeURIComponent(rut)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
