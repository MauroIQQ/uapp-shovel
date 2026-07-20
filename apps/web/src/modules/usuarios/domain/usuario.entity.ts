export interface Usuario {
  rut: string;
  rut_empresa: string;
  nombre: string;
  paterno: string;
  materno: string | null;
  perfil: number;
  perfil_nombre: string;
  correo: string | null;
  created: string | null;
  updated: string | null;
}

export function nombreCompleto(usuario: Usuario): string {
  const partes = [usuario.nombre, usuario.paterno, usuario.materno].filter(Boolean);
  return partes.join(" ");
}
