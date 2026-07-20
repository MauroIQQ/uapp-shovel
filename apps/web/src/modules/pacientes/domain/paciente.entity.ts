export interface Paciente {
  rut: string;
  id_prevision: number | null;
  rut_empresa: string | null;
  nombre_completo: string;
  direccion: string | null;
  correo: string | null;
  ciudad: string | null;
  comuna: string | null;
  pais: string | null;
  telefono: string | null;
  celular: string | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  edad: number | null;
  estado_civil: string | null;
  estado: string | null;
  extranjero: boolean | null;
  created: string | null;
  updated: string | null;
}

export function calcularEdad(fechaNacimiento: string | null): number | null {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
