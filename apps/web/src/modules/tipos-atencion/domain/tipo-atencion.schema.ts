import { z } from "zod";

export const baseTipoAtencionSchema = z.object({
  descripcion: z.string().min(1, "Descripción es requerida"),
  estado: z.enum(["activo", "inactivo"]),
});

export const crearTipoAtencionSchema = baseTipoAtencionSchema;

export type TipoAtencionFormData = z.infer<typeof crearTipoAtencionSchema>;

export const actualizarTipoAtencionSchema = baseTipoAtencionSchema.partial();

export type ActualizarTipoAtencionData = z.infer<typeof actualizarTipoAtencionSchema>;
