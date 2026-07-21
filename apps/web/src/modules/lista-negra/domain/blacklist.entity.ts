export interface BlacklistedPatient {
  rut: string
  nombre_completo: string
  telefono: string | null
  correo: string | null
  no_show_count: number
  updated: Date | null
}
