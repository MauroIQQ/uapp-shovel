import { z } from "zod";

export const crearCitaSchema = z.object({
  rut_paciente: z.string(),
  fecha: z.string().min(1, "Fecha es requerida"),
  hora: z.string().optional(),
  id_tipo_consulta: z.coerce.number().int().positive().optional(),
  id_prevision: z.coerce.number().int().optional().nullable(),
  observacion: z.string().optional().nullable(),
  confirmada: z.string().optional().nullable(),
  atendido: z.string().optional().nullable(),
  sobrecupo: z.boolean().optional(),
  num_llegada: z.coerce.number().int().optional(),
});

export type CrearCitaFormData = z.infer<typeof crearCitaSchema>;

export const actualizarCitaSchema = z.object({
  fecha: z.string().optional(),
  hora: z.string().optional(),
  id_tipo_consulta: z.coerce.number().int().positive().optional(),
  id_prevision: z.coerce.number().int().optional().nullable(),
  observacion: z.string().optional().nullable(),
  confirmada: z.string().optional().nullable(),
  estado: z.enum(["activo", "inactivo"]).optional(),
  atendido: z.string().optional().nullable(),
  sobrecupo: z.boolean().optional(),
  num_llegada: z.coerce.number().int().optional(),
});

export type ActualizarCitaData = z.infer<typeof actualizarCitaSchema>;
