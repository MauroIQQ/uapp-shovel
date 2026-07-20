export interface FichaClinica {
  id: number;
  rut_paciente: string;
  rut_empresa: string;
  peso: string | null;
  talla: string | null;
  imc: string | null;
  circunferencia_cintura: string | null;
  pliegues: string | null;
  bioimpedancia: string | null;
  genero: string | null;
  ocupacion: string | null;
  grupo_sanguineo: string | null;
  factor_rh: string | null;
  donante_organos: boolean | null;
  observaciones_generales: string | null;
  estado: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_parentezco: string | null;
  contacto_emergencia_telefono: string | null;
  contacto_emergencia_direccion: string | null;
  created: string | null;
  updated: string | null;
}

export interface AntePersonal {
  id: number;
  id_ficha: number;
  tipo: string;
  observaciones: string | null;
}

export interface AnteQuirurgico {
  id: number;
  id_ficha: number;
  fecha: string | null;
  procedimiento: string;
  centro_medico: string | null;
  observaciones: string | null;
}

export interface AnteFamiliar {
  id: number;
  id_ficha: number;
  parentesco: string;
  enfermedad: string;
  edad_diagnostico: number | null;
  observaciones: string | null;
}

export interface Alergia {
  id: number;
  id_ficha: number;
  tipo: string;
  descripcion: string;
  severidad: string | null;
  reaccion: string | null;
  activa: boolean;
}

export interface MedicacionCronica {
  id: number;
  id_ficha: number;
  medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
  via: string | null;
  fecha_inicio: string | null;
  indicacion: string | null;
  activo: boolean;
}

export interface ProblemaActivo {
  id: number;
  id_ficha: number;
  codigo_cie10: string | null;
  diagnostico: string;
  fecha_inicio: string | null;
  estado: string | null;
  observaciones: string | null;
}

export interface Habitos {
  id_ficha: number;
  tabaquismo: boolean | null;
  cantidad_diaria: number | null;
  alcohol: boolean | null;
  frecuencia_alcohol: string | null;
  drogas: boolean | null;
  actividad_fisica: boolean | null;
  horas_sueno: number | null;
  alimentacion: string | null;
}

export interface Bitacora {
  id: number;
  id_ficha_clinica: number;
  id_hora: number | null;
  motivo_consulta: string;
  enfermedad_actual: string | null;
  anamnesis: string | null;
  examen_fisico: string | null;
  peso: string | null;
  talla: string | null;
  imc: string | null;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  pulso: number | null;
  frecuencia_respiratoria: number | null;
  saturacion_o2: number | null;
  temperatura: string | null;
  glicemia: string | null;
  perimetro_abdominal: string | null;
  plan_terapeutico: string | null;
  indicaciones: string | null;
  proximo_control_fecha: string | null;
  proximo_control_motivo: string | null;
  created: string | null;
  updated: string | null;
  diagnosticos?: Diagnostico[];
  recetas?: Receta[];
}

export interface Diagnostico {
  id: number;
  id_bitacora: number;
  codigo_cie10: string | null;
  diagnostico: string;
  principal: boolean;
  observaciones: string | null;
}

export interface Receta {
  id: number;
  id_bitacora: number;
  validez: string | null;
  estado: string | null;
  observaciones: string | null;
  detalle: RecetaDetalle[];
}

export interface RecetaDetalle {
  id: number;
  id_receta: number;
  medicamento: string;
  concentracion: string | null;
  forma_farmaceutica: string | null;
  presentacion: string | null;
  dosis: string | null;
  frecuencia: string | null;
  duracion: string | null;
  cantidad: number | null;
  via_administracion: string | null;
  indicaciones: string | null;
  observaciones: string | null;
}

export interface OrdenMedica {
  id: number;
  id_bitacora: number;
  tipo: string;
  descripcion: string;
  urgencia: string | null;
  observaciones: string | null;
}

export interface Procedimiento {
  id: number;
  id_bitacora: number;
  procedimiento: string;
  fecha: string | null;
  resultado: string | null;
  observaciones: string | null;
}

export interface DocumentoEmitido {
  id: number;
  id_bitacora: number;
  nombre: string;
  tipo: string;
  ruta: string | null;
  usuario: string | null;
}

export interface Adjunto {
  id: number;
  id_bitacora: number;
  nombre: string;
  categoria: string | null;
  tipo_mime: string | null;
  tamaño: number | null;
  ruta: string;
  comentario: string | null;
  usuario: string | null;
}

export interface ArchivoGeneral {
  id: number;
  id_ficha: number;
  nombre: string;
  categoria: string | null;
  id_subcategoria: number | null;
  tipo_mime: string | null;
  tamaño: number | null;
  ruta: string;
  url_descarga?: string | null;
  observacion: string | null;
  usuario: string | null;
  created: string;
  subcategoria?: { id: number; nombre: string; codigo: string; categoria: { id: number; nombre: string; codigo: string } } | null;
}
