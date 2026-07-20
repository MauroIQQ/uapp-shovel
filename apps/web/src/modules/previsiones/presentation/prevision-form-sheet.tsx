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

import type { Prevision } from "../domain/prevision.entity";
import { crearPrevisionSchema, type PrevisionFormData } from "../domain/prevision.schema";
import { createPrevision, updatePrevision } from "../infrastructure/previsiones.service";

interface PrevisionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prevision?: Prevision | null;
  onSuccess: () => void;
}

export function PrevisionFormSheet({ open, onOpenChange, prevision, onSuccess }: PrevisionFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const isEditing = !!prevision;

  const form = useForm<PrevisionFormData>({
    resolver: zodResolver(crearPrevisionSchema) as never,
    defaultValues: {
      nombre: "",
      valor: 0,
      estado: "activo",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (prevision) {
        form.reset({
          nombre: prevision.nombre,
          valor: prevision.valor,
          estado: prevision.estado as "activo" | "inactivo",
        });
      } else {
        form.reset({ nombre: "", valor: 0, estado: "activo" });
      }
    }
  }, [open, prevision, form]);

  async function onSubmit(data: PrevisionFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        await updatePrevision(prevision?.id, data);
      } else {
        await createPrevision(data);
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
          <SheetTitle>{isEditing ? "Editar previsión" : "Nueva previsión"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos de la previsión" : "Ingresa los datos de la nueva previsión"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="prevision-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="nombre"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="prevision-nombre">Nombre</FieldLabel>
                <Input
                  id="prevision-nombre"
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
            name="valor"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="prevision-valor">Valor</FieldLabel>
                <Input
                  id="prevision-valor"
                  type="number"
                  min={0}
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
                <FieldLabel htmlFor="prevision-estado">Estado</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="prevision-estado" className="w-full" aria-invalid={fieldState.invalid}>
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
          <Button type="submit" form="prevision-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear previsión"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
