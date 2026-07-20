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

import type { Horario } from "../domain/horario.entity";
import { crearHorarioSchema, type HorarioFormData } from "../domain/horario.schema";
import { createHorario, updateHorario } from "../infrastructure/horarios.service";

interface HorarioFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horario?: Horario | null;
  onSuccess: () => void;
}

export function HorarioFormSheet({ open, onOpenChange, horario, onSuccess }: HorarioFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const isEditing = !!horario;

  const form = useForm<HorarioFormData>({
    resolver: zodResolver(crearHorarioSchema) as never,
    defaultValues: {
      hora: "",
      activo: "activo",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (horario) {
        form.reset({
          hora: horario.hora.slice(0, 5),
          activo: horario.activo as "activo" | "inactivo",
        });
      } else {
        form.reset({ hora: "", activo: "activo" });
      }
    }
  }, [open, horario, form]);

  async function onSubmit(data: HorarioFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        await updateHorario(horario?.id, data);
      } else {
        await createHorario(data);
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
          <SheetTitle>{isEditing ? "Editar horario" : "Nuevo horario"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos del horario" : "Ingresa los datos del nuevo horario"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="horario-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="hora"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="horario-hora">Hora</FieldLabel>
                <Input
                  id="horario-hora"
                  type="time"
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
            name="activo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="horario-activo">Estado</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="horario-activo" className="w-full" aria-invalid={fieldState.invalid}>
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
          <Button type="submit" form="horario-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear horario"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
