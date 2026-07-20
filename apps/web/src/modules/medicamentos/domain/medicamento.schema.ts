import { z } from "zod";

export const baseMedicamentoSchema = z.object({
  nombre: z.string().min(1, "Nombre es requerido"),
  id_categoria: z.coerce.number().int().positive("Categoría es requerida"),
});

export const crearMedicamentoSchema = baseMedicamentoSchema;

export type MedicamentoFormData = z.infer<typeof crearMedicamentoSchema>;

export const actualizarMedicamentoSchema = baseMedicamentoSchema.partial();

export type ActualizarMedicamentoData = z.infer<typeof actualizarMedicamentoSchema>;
