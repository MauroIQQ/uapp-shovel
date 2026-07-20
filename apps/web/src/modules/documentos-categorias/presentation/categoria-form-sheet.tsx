"use client";

import * as React from "react";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { CategoriaConSubcategorias } from "../domain/documento-categoria.entity";
import type { CrearCategoriaData } from "../domain/documento-categoria.schema";

interface CategoriaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaId: number | undefined;
  categorias: CategoriaConSubcategorias[];
  onSave: (data: CrearCategoriaData, id?: number) => Promise<void>;
}

export function CategoriaFormSheet({ open, onOpenChange, categoriaId, categorias, onSave }: CategoriaFormSheetProps) {
  const [saving, setSaving] = React.useState(false);

  const editCat = categoriaId ? categorias.find((c) => c.id === categoriaId) : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrearCategoriaData>({
    defaultValues: { codigo: "", nombre: "", descripcion: "", orden: 0, activo: true },
  });

  React.useEffect(() => {
    if (open) {
      if (editCat) {
        reset({
          codigo: editCat.codigo,
          nombre: editCat.nombre,
          descripcion: editCat.descripcion ?? "",
          orden: editCat.orden,
          activo: editCat.activo,
        });
      } else {
        reset({ codigo: "", nombre: "", descripcion: "", orden: 0, activo: true });
      }
    }
  }, [open, editCat, reset]);

  async function onSubmit(data: CrearCategoriaData) {
    setSaving(true);
    try {
      await onSave(data, categoriaId);
      onOpenChange(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{categoriaId ? "Editar Categoría" : "Nueva Categoría"}</SheetTitle>
          <SheetDescription>Administración de categorías de documentos clínicos</SheetDescription>
        </SheetHeader>

        <form
          id="cat-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={control}
            name="codigo"
            rules={{ required: "Código es requerido" }}
            render={({ field }) => (
              <Field className="gap-1.5" data-invalid={!!errors.codigo}>
                <FieldLabel>Código</FieldLabel>
                <Input {...field} placeholder="Ej: LAB" />
                {errors.codigo && <FieldError errors={[errors.codigo]} />}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="nombre"
            rules={{ required: "Nombre es requerido" }}
            render={({ field }) => (
              <Field className="gap-1.5" data-invalid={!!errors.nombre}>
                <FieldLabel>Nombre</FieldLabel>
                <Input {...field} placeholder="Ej: Laboratorio y Bioquímica" />
                {errors.nombre && <FieldError errors={[errors.nombre]} />}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="descripcion"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel>Descripción</FieldLabel>
                <Textarea {...field} value={field.value ?? ""} rows={2} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="orden"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel>Orden</FieldLabel>
                <Input type="number" {...field} value={field.value} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="activo"
            render={({ field }) => (
              <Field orientation="horizontal" className="gap-2">
                <Switch id="cat-activo" checked={field.value} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor="cat-activo">Activo</FieldLabel>
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="cat-form" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
