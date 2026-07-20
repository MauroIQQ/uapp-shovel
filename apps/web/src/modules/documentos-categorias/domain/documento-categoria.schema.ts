import { z } from "zod";

export const crearCategoriaSchema = z.object({
  codigo: z.string().min(1, "Código es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  orden: z.coerce.number().int().default(0),
  activo: z.boolean().default(true),
});
export type CrearCategoriaData = z.infer<typeof crearCategoriaSchema>;

export const actualizarCategoriaSchema = crearCategoriaSchema.partial();
export type ActualizarCategoriaData = z.infer<typeof actualizarCategoriaSchema>;

export const crearSubcategoriaSchema = z.object({
  codigo: z.string().min(1, "Código es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  descripcion: z.string().optional().nullable(),
  orden: z.coerce.number().int().default(0),
  activo: z.boolean().default(true),
});
export type CrearSubcategoriaData = z.infer<typeof crearSubcategoriaSchema>;

export const actualizarSubcategoriaSchema = crearSubcategoriaSchema.partial();
export type ActualizarSubcategoriaData = z.infer<typeof actualizarSubcategoriaSchema>;
