"use client";

import * as React from "react";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { CrearSubcategoriaData } from "../domain/documento-categoria.schema";

interface SubcategoriaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idCategoria: number | undefined;
  editingSub: { id: number; idCat: number } | undefined;
  onSave: (data: CrearSubcategoriaData, idCategoria: number | undefined, subId: number | undefined) => Promise<void>;
}

export function SubcategoriaFormDialog({
  open,
  onOpenChange,
  idCategoria,
  editingSub,
  onSave,
}: SubcategoriaFormDialogProps) {
  const [saving, setSaving] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrearSubcategoriaData>({
    defaultValues: { codigo: "", nombre: "", descripcion: "", orden: 0, activo: true },
  });

  React.useEffect(() => {
    if (open) {
      reset({ codigo: "", nombre: "", descripcion: "", orden: 0, activo: true });
    }
  }, [open, reset]);

  async function onSubmit(data: CrearSubcategoriaData) {
    setSaving(true);
    try {
      await onSave(data, idCategoria ?? editingSub?.idCat, editingSub?.id);
      onOpenChange(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingSub ? "Editar Subcategoría" : "Nueva Subcategoría"}</DialogTitle>
          <DialogDescription>Administración de subcategorías de documentos clínicos</DialogDescription>
        </DialogHeader>

        <form id="sub-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="codigo"
            rules={{ required: "Código es requerido" }}
            render={({ field }) => (
              <Field className="gap-1.5" data-invalid={!!errors.codigo}>
                <FieldLabel>Código</FieldLabel>
                <Input {...field} placeholder="Ej: LAB001" />
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
                <Input {...field} placeholder="Ej: Hematología Completa" />
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
                <Switch id="sub-activo" checked={field.value} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor="sub-activo">Activo</FieldLabel>
              </Field>
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
