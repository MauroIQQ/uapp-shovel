export interface PacienteBusqueda {
  rut: string;
  nombre_completo: string;
  sexo: string | null;
  fecha_nacimiento: string | null;
  edad: number | null;
  telefono: string | null;
  celular: string | null;
  correo: string | null;
  prevision: string | null;
  ultima_cita: string | null;
  confirmada: string | null;
  atendido: string | null;
}
