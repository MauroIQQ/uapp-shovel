import { z } from "zod";

export const basePrevisionSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  valor: z.coerce.number().int().min(0, "Valor debe ser 0 o mayor").default(0),
  estado: z.enum(["activo", "inactivo"]),
});

export const crearPrevisionSchema = basePrevisionSchema;

export type PrevisionFormData = z.infer<typeof crearPrevisionSchema>;

export const actualizarPrevisionSchema = basePrevisionSchema.partial();

export type ActualizarPrevisionData = z.infer<typeof actualizarPrevisionSchema>;
