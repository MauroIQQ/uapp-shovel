import { z } from "zod";

import { Perfil, validarRut } from "@uapp/shared";

export const baseUsuarioSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  paterno: z.string().min(1, "Apellido paterno es requerido"),
  materno: z.string().optional().nullable(),
  perfil: z.nativeEnum(Perfil),
  correo: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  rut_empresa: z.string().optional().nullable(),
});

export const crearUsuarioSchema = baseUsuarioSchema
  .extend({
    password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
  })
  .superRefine((data, ctx) => {
    if (!validarRut(data.rut)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RUT inválido (dígito verificador incorrecto)",
        path: ["rut"],
      });
    }
  });

export type UsuarioFormData = z.infer<typeof crearUsuarioSchema>;

export const actualizarUsuarioSchema = baseUsuarioSchema
  .partial()
  .omit({ rut: true })
  .extend({
    password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres").optional().nullable().or(z.literal("")),
  });

export type ActualizarUsuarioData = z.infer<typeof actualizarUsuarioSchema>;
