import { z } from "zod";

export const crearDiaBloqueadoSchema = z.object({
  fecha: z.string().min(1, "Fecha es requerida"),
  motivo: z.string().optional().nullable(),
});

export type DiaBloqueadoFormData = z.infer<typeof crearDiaBloqueadoSchema>;
