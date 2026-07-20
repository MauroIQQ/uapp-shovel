export interface AgendaCita {
  id: number;
  rut_paciente: string;
  paciente_nombre: string;
  fecha_hora: string;
  id_tipo_consulta: number;
  tipo_descripcion: string;
  id_prevision: number | null;
  prevision_nombre: string | null;
  observacion: string | null;
  estado: string | null;
  confirmada: string | null;
  atendido: string | null;
  sobrecupo: boolean;
  origen: string | null;
  num_llegada: number;
  total: number;
  created: string | null;
  updated: string | null;
}

export interface TipoHora {
  id: number;
  descripcion: string;
  estado: boolean;
}

export interface HorarioSlot {
  id: number;
  hora: string;
  activo: boolean;
}

export interface ResumenMes {
  fecha: string;
  count: number;
  bloqueado?: boolean;
  motivo?: string | null;
}
