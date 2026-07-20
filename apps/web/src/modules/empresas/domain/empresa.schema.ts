import { validarRut } from "@uapp/shared";
import { z } from "zod";

export const baseEmpresaSchema = z.object({
  rut_empresa: z.string().min(1, "RUT empresa es requerido"),
  giro: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  correo: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  comuna: z.string().optional().nullable(),
  ciudad: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  rut_representante: z.string().optional().nullable(),
  nombre_representante: z.string().optional().nullable(),
  estado: z.enum(["activo", "inactivo"]),
});

export const crearEmpresaSchema = baseEmpresaSchema.superRefine((data, ctx) => {
  if (!validarRut(data.rut_empresa)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "RUT empresa inválido (dígito verificador incorrecto)",
      path: ["rut_empresa"],
    });
  }
});

export type EmpresaFormData = z.infer<typeof crearEmpresaSchema>;

export const actualizarEmpresaSchema = baseEmpresaSchema.partial().omit({ rut_empresa: true });

export type ActualizarEmpresaData = z.infer<typeof actualizarEmpresaSchema>;
