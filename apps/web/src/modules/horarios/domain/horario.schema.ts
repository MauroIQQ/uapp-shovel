import { z } from "zod";

export const baseHorarioSchema = z.object({
  hora: z.string().min(1, "Hora es requerida"),
  activo: z.enum(["activo", "inactivo"]),
});

export const crearHorarioSchema = baseHorarioSchema;

export type HorarioFormData = z.infer<typeof crearHorarioSchema>;

export const actualizarHorarioSchema = baseHorarioSchema.partial();

export type ActualizarHorarioData = z.infer<typeof actualizarHorarioSchema>;
