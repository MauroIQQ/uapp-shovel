import { z } from "zod";

// ─── Ficha ───
export const actualizarFichaSchema = z.object({
  peso: z.string().optional().nullable(),
  talla: z.string().optional().nullable(),
  imc: z.string().optional().nullable(),
  circunferencia_cintura: z.string().optional().nullable(),
  pliegues: z.string().optional().nullable(),
  bioimpedancia: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  ocupacion: z.string().optional().nullable(),
  grupo_sanguineo: z.string().optional().nullable(),
  factor_rh: z.string().optional().nullable(),
  donante_organos: z.boolean().optional().nullable(),
  observaciones_generales: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  contacto_emergencia_nombre: z.string().optional().nullable(),
  contacto_emergencia_parentezco: z.string().optional().nullable(),
  contacto_emergencia_telefono: z.string().optional().nullable(),
  contacto_emergencia_direccion: z.string().optional().nullable(),
});
export type ActualizarFichaData = z.infer<typeof actualizarFichaSchema>;

// ─── Antecedentes Personales ───
export const crearAntePersonalSchema = z.object({
  tipo: z.string().min(1, "Tipo es requerido"),
  observaciones: z.string().optional().nullable(),
});
export type CrearAntePersonalData = z.infer<typeof crearAntePersonalSchema>;

// ─── Antecedentes Quirúrgicos ───
export const crearAnteQuirurgicoSchema = z.object({
  fecha: z.string().optional().nullable(),
  procedimiento: z.string().min(1, "Procedimiento es requerido"),
  centro_medico: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});
export type CrearAnteQuirurgicoData = z.infer<typeof crearAnteQuirurgicoSchema>;
export const actualizarAnteQuirurgicoSchema = crearAnteQuirurgicoSchema.partial();
export type ActualizarAnteQuirurgicoData = z.infer<typeof actualizarAnteQuirurgicoSchema>;

// ─── Antecedentes Familiares ───
export const crearAnteFamiliarSchema = z.object({
  parentesco: z.string().min(1, "Parentesco es requerido"),
  enfermedad: z.string().min(1, "Enfermedad es requerida"),
  edad_diagnostico: z.coerce.number().int().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});
export type CrearAnteFamiliarData = z.infer<typeof crearAnteFamiliarSchema>;
export const actualizarAnteFamiliarSchema = crearAnteFamiliarSchema.partial();
export type ActualizarAnteFamiliarData = z.infer<typeof actualizarAnteFamiliarSchema>;

// ─── Alergias ───
export const crearAlergiaSchema = z.object({
  tipo: z.string().min(1, "Tipo es requerido"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  severidad: z.string().optional().nullable(),
  reaccion: z.string().optional().nullable(),
  activa: z.boolean().default(true),
});
export type CrearAlergiaData = z.infer<typeof crearAlergiaSchema>;
export const actualizarAlergiaSchema = crearAlergiaSchema.partial();
export type ActualizarAlergiaData = z.infer<typeof actualizarAlergiaSchema>;

// ─── Medicación Crónica ───
export const crearMedicacionSchema = z.object({
  medicamento: z.string().min(1, "Medicamento es requerido"),
  dosis: z.string().optional().nullable(),
  frecuencia: z.string().optional().nullable(),
  via: z.string().optional().nullable(),
  fecha_inicio: z.string().optional().nullable(),
  indicacion: z.string().optional().nullable(),
  activo: z.boolean().default(true),
});
export type CrearMedicacionData = z.infer<typeof crearMedicacionSchema>;
export const actualizarMedicacionSchema = crearMedicacionSchema.partial();
export type ActualizarMedicacionData = z.infer<typeof actualizarMedicacionSchema>;

// ─── Problemas Activos ───
export const crearProblemaActivoSchema = z.object({
  codigo_cie10: z.string().optional().nullable(),
  diagnostico: z.string().min(1, "Diagnóstico es requerido"),
  fecha_inicio: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});
export type CrearProblemaActivoData = z.infer<typeof crearProblemaActivoSchema>;
export const actualizarProblemaActivoSchema = crearProblemaActivoSchema.partial();
export type ActualizarProblemaActivoData = z.infer<typeof actualizarProblemaActivoSchema>;

// ─── Hábitos ───
export const actualizarHabitosSchema = z.object({
  tabaquismo: z.boolean().optional().nullable(),
  cantidad_diaria: z.coerce.number().int().optional().nullable(),
  alcohol: z.boolean().optional().nullable(),
  frecuencia_alcohol: z.string().optional().nullable(),
  drogas: z.boolean().optional().nullable(),
  actividad_fisica: z.boolean().optional().nullable(),
  horas_sueno: z.coerce.number().int().optional().nullable(),
  alimentacion: z.string().optional().nullable(),
});
export type ActualizarHabitosData = z.infer<typeof actualizarHabitosSchema>;

// ─── Bitácora ───
export const crearBitacoraSchema = z.object({
  id_hora: z.coerce.number().int().optional().nullable(),
  motivo_consulta: z.string().min(1, "Motivo de consulta es requerido"),
  enfermedad_actual: z.string().optional().nullable(),
  anamnesis: z.string().optional().nullable(),
  examen_fisico: z.string().optional().nullable(),
  peso: z.string().optional().nullable(),
  talla: z.string().optional().nullable(),
  imc: z.string().optional().nullable(),
  presion_sistolica: z.coerce.number().int().optional().nullable(),
  presion_diastolica: z.coerce.number().int().optional().nullable(),
  pulso: z.coerce.number().int().optional().nullable(),
  frecuencia_respiratoria: z.coerce.number().int().optional().nullable(),
  saturacion_o2: z.coerce.number().int().optional().nullable(),
  temperatura: z.string().optional().nullable(),
  glicemia: z.string().optional().nullable(),
  perimetro_abdominal: z.string().optional().nullable(),
  plan_terapeutico: z.string().optional().nullable(),
  indicaciones: z.string().optional().nullable(),
  proximo_control_fecha: z.string().optional().nullable(),
  proximo_control_motivo: z.string().optional().nullable(),
});
export type CrearBitacoraData = z.infer<typeof crearBitacoraSchema>;
export const actualizarBitacoraSchema = crearBitacoraSchema.partial();
export type ActualizarBitacoraData = z.infer<typeof actualizarBitacoraSchema>;

// ─── Diagnósticos ───
export const crearDiagnosticoSchema = z.object({
  codigo_cie10: z.string().optional().nullable(),
  diagnostico: z.string().min(1, "Diagnóstico es requerido"),
  principal: z.boolean().default(false),
  observaciones: z.string().optional().nullable(),
});
export type CrearDiagnosticoData = z.infer<typeof crearDiagnosticoSchema>;
export const actualizarDiagnosticoSchema = crearDiagnosticoSchema.partial();
export type ActualizarDiagnosticoData = z.infer<typeof actualizarDiagnosticoSchema>;

// ─── Recetas ───
export const crearRecetaSchema = z.object({
  validez: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  detalle: z.array(z.object({
    medicamento: z.string().min(1, "Medicamento es requerido"),
    concentracion: z.string().optional().nullable(),
    forma_farmaceutica: z.string().optional().nullable(),
    presentacion: z.string().optional().nullable(),
    dosis: z.string().optional().nullable(),
    frecuencia: z.string().optional().nullable(),
    duracion: z.string().optional().nullable(),
    cantidad: z.coerce.number().int().optional().nullable(),
    via_administracion: z.string().optional().nullable(),
    indicaciones: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
  })).optional().default([]),
});
export type CrearRecetaData = z.infer<typeof crearRecetaSchema>;

// ─── Órdenes Médicas ───
export const crearOrdenMedicaSchema = z.object({
  tipo: z.string().min(1, "Tipo es requerido"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  urgencia: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});
export type CrearOrdenMedicaData = z.infer<typeof crearOrdenMedicaSchema>;

// ─── Procedimientos ───
export const crearProcedimientoSchema = z.object({
  procedimiento: z.string().min(1, "Procedimiento es requerido"),
  fecha: z.string().optional().nullable(),
  resultado: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});
export type CrearProcedimientoData = z.infer<typeof crearProcedimientoSchema>;
