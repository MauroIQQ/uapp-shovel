import { z } from "zod";

export const crearHoraBloqueadaSchema = z.object({
  fecha: z.string().min(1, "Fecha es requerida"),
  hora: z.string().min(1, "Hora es requerida"),
  motivo: z.string().optional().nullable(),
});

export type HoraBloqueadaFormData = z.infer<typeof crearHoraBloqueadaSchema>;
