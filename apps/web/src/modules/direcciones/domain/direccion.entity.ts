export interface Direccion {
  id: number;
  rut_empresa: string;
  nombre: string;
  direccion: string;
  piso: string | null;
  oficina: string | null;
  comuna: string | null;
  ciudad: string | null;
  activo: boolean;
  created: string;
  updated: string;
}
