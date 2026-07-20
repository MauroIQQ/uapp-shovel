import { z } from "zod";

export const permisosUpdateSchema = z.object({
  rut_empresa: z.string().min(1),
  perfil: z.number().int(),
  items: z.array(
    z.object({
      id_item: z.string(),
      nombre: z.string(),
    }),
  ),
});

export type PermisosUpdateData = z.infer<typeof permisosUpdateSchema>;
