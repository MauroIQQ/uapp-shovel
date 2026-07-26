import { z } from "zod";

export const direccionSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  direccion: z.string().min(1, "Dirección es requerida"),
  piso: z.string().optional().nullable(),
  oficina: z.string().optional().nullable(),
  comuna: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  activo: z.boolean().optional(),
});

export type DireccionFormData = z.infer<typeof direccionSchema>;
