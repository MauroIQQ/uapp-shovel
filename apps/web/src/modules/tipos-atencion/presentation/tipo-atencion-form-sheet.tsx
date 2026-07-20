"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import type { TipoAtencion } from "../domain/tipo-atencion.entity";
import { crearTipoAtencionSchema, type TipoAtencionFormData } from "../domain/tipo-atencion.schema";
import { createTipoAtencion, updateTipoAtencion } from "../infrastructure/tipos-atencion.service";

interface TipoAtencionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoAtencion?: TipoAtencion | null;
  onSuccess: () => void;
}

export function TipoAtencionFormSheet({ open, onOpenChange, tipoAtencion, onSuccess }: TipoAtencionFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const isEditing = !!tipoAtencion;

  const form = useForm<TipoAtencionFormData>({
    resolver: zodResolver(crearTipoAtencionSchema) as never,
    defaultValues: {
      descripcion: "",
      estado: "activo",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (tipoAtencion) {
        form.reset({
          descripcion: tipoAtencion.descripcion,
          estado: tipoAtencion.estado as "activo" | "inactivo",
        });
      } else {
        form.reset({ descripcion: "", estado: "activo" });
      }
    }
  }, [open, tipoAtencion, form]);

  async function onSubmit(data: TipoAtencionFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        await updateTipoAtencion(tipoAtencion?.id, data);
      } else {
        await createTipoAtencion(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      // handled by caller
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar tipo de atención" : "Nuevo tipo de atención"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos del tipo de atención" : "Ingresa los datos del nuevo tipo de atención"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="tipo-atencion-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="descripcion"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ta-descripcion">Descripción</FieldLabel>
                <Input
                  id="ta-descripcion"
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="estado"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ta-estado">Estado</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="ta-estado" className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="tipo-atencion-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear tipo de atención"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
