import { z } from "zod";

export const crearHoraBloqueadaSchema = z.object({
  fecha: z.string().min(1, "Fecha es requerida"),
  horas: z.array(z.string()).min(1, "Selecciona al menos un horario"),
  motivo: z.string().optional().nullable(),
});

export type HoraBloqueadaFormData = z.infer<typeof crearHoraBloqueadaSchema>;
