export interface Empresa {
  rut_empresa: string;
  giro: string | null;
  direccion: string | null;
  correo: string | null;
  comuna: string | null;
  ciudad: string | null;
  telefono: string | null;
  celular: string | null;
  rut_representante: string | null;
  nombre_representante: string | null;
  password: string | null;
  fecha_creacion: string | null;
  version: number;
  dias: number;
  estado: string | null;
  created: string | null;
  updated: string | null;
}
