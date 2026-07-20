"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import type { CategoriaMedicamento, Medicamento } from "../domain/medicamento.entity";
import { crearMedicamentoSchema, type MedicamentoFormData } from "../domain/medicamento.schema";
import {
  createCategoria,
  createMedicamento,
  fetchCategorias,
  updateMedicamento,
} from "../infrastructure/medicamentos.service";

interface MedicamentoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicamento?: Medicamento | null;
  onSuccess: () => void;
}

export function MedicamentoFormSheet({ open, onOpenChange, medicamento, onSuccess }: MedicamentoFormSheetProps) {
  const [categorias, setCategorias] = React.useState<CategoriaMedicamento[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [showNewCategoria, setShowNewCategoria] = React.useState(false);
  const [newCategoriaNombre, setNewCategoriaNombre] = React.useState("");
  const [creatingCategoria, setCreatingCategoria] = React.useState(false);

  const isEditing = !!medicamento;

  const form = useForm<MedicamentoFormData>({
    resolver: zodResolver(crearMedicamentoSchema) as never,
    defaultValues: {
      nombre: "",
      id_categoria: undefined as unknown as number,
    },
  });

  const loadCategorias = React.useCallback(async () => {
    try {
      const list = await fetchCategorias();
      setCategorias(list);
    } catch {
      // silent
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      loadCategorias();
      if (medicamento) {
        form.reset({
          nombre: medicamento.nombre,
          id_categoria: medicamento.id_categoria,
        });
      } else {
        form.reset({
          nombre: "",
          id_categoria: undefined as unknown as number,
        });
      }
      setShowNewCategoria(false);
      setNewCategoriaNombre("");
    }
  }, [open, medicamento, form, loadCategorias]);

  async function handleCreateCategoria() {
    const name = newCategoriaNombre.trim();
    if (!name || creatingCategoria) return;

    setCreatingCategoria(true);
    try {
      const created = await createCategoria(name);
      setCategorias((prev) => [...prev, created]);
      form.setValue("id_categoria", created.id);
      setShowNewCategoria(false);
      setNewCategoriaNombre("");
    } catch {
      // silent
    } finally {
      setCreatingCategoria(false);
    }
  }

  async function onSubmit(data: MedicamentoFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        await updateMedicamento(medicamento?.id, data);
      } else {
        await createMedicamento(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      // error handled by caller
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Medicamento" : "Nuevo Medicamento"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos del medicamento" : "Ingresa los datos del nuevo medicamento"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="medicamento-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="nombre"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="med-nombre">Nombre del medicamento</FieldLabel>
                <Input
                  {...field}
                  id="med-nombre"
                  placeholder="Nombre del medicamento"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="id_categoria"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="med-categoria">Categoría</FieldLabel>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="med-categoria" className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccionar categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mt-0 shrink-0"
                    onClick={() => setShowNewCategoria(true)}
                    aria-label="Agregar nueva categoría"
                  >
                    <Plus />
                  </Button>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                {showNewCategoria && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      placeholder="Nombre de la nueva categoría"
                      value={newCategoriaNombre}
                      onChange={(e) => setNewCategoriaNombre(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategoria();
                        }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCategoria}
                      disabled={creatingCategoria || !newCategoriaNombre.trim()}
                    >
                      {creatingCategoria && <Loader2 className="animate-spin" />}
                      Crear
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNewCategoria(false);
                        setNewCategoriaNombre("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="medicamento-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear medicamento"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
