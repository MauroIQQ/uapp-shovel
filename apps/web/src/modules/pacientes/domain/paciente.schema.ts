import { z } from "zod";

import { validarRut } from "@uapp/shared";

const basePacienteSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  extranjero: z.boolean().default(false),
  nombre_completo: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  sexo: z.enum(["Masculino", "Femenino", "Otro"]).optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  correo: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  direccion: z.string().optional().nullable(),
  id_prevision: z.coerce.number().int().positive().optional().nullable(),
  estado: z.enum(["activo", "inactivo"]),
});

export const crearPacienteSchema = basePacienteSchema.superRefine((data, ctx) => {
  if (!data.extranjero && !validarRut(data.rut)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RUT inválido (dígito verificador incorrecto)",
      path: ["rut"],
    });
  }
});

export type PacienteFormData = z.infer<typeof crearPacienteSchema>;

export const actualizarPacienteSchema = basePacienteSchema.partial().omit({ rut: true });

export type ActualizarPacienteData = z.infer<typeof actualizarPacienteSchema>;
