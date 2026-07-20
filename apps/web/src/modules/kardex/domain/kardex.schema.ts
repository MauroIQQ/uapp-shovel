import { z } from "zod";

export const baseArticuloSchema = z.object({
  descripcion: z.string().min(1, "Descripción es requerida"),
  stock_actual: z.coerce.number().int().min(0, "Stock no puede ser negativo").default(0),
});

export const crearArticuloSchema = baseArticuloSchema;

export type KardexFormData = z.infer<typeof crearArticuloSchema>;

export const actualizarArticuloSchema = baseArticuloSchema.partial();

export type ActualizarArticuloData = z.infer<typeof actualizarArticuloSchema>;
