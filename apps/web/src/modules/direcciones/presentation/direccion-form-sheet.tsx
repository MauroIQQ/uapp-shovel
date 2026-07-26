"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

import type { Direccion } from "../domain/direccion.entity";
import { direccionSchema, type DireccionFormData } from "../domain/direccion.schema";
import { createDireccion, updateDireccion } from "../infrastructure/direcciones.service";

interface DireccionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direccion?: Direccion | null;
  onSuccess: () => void;
}

export function DireccionFormSheet({ open, onOpenChange, direccion, onSuccess }: DireccionFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const isEditing = !!direccion;

  const form = useForm<DireccionFormData>({
    resolver: zodResolver(direccionSchema) as never,
    defaultValues: {
      nombre: "",
      direccion: "",
      piso: null,
      oficina: null,
      comuna: null,
      ciudad: null,
      activo: true,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (direccion) {
        form.reset({
          nombre: direccion.nombre,
          direccion: direccion.direccion,
          piso: direccion.piso,
          oficina: direccion.oficina,
          comuna: direccion.comuna,
          ciudad: direccion.ciudad,
          activo: direccion.activo,
        });
      } else {
        form.reset({ nombre: "", direccion: "", piso: null, oficina: null, comuna: null, ciudad: null, activo: true });
      }
    }
  }, [open, direccion, form]);

  async function onSubmit(data: DireccionFormData) {
    setSaving(true);
    try {
      if (isEditing && direccion) {
        await updateDireccion(direccion.id, data);
      } else {
        await createDireccion(data);
      }
      onSuccess();
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
          <SheetTitle>{isEditing ? "Editar Dirección" : "Nueva Dirección"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Modifica los datos de la dirección"
              : "Ingresa los datos de la nueva dirección"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="direccion-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="nombre"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dir-nombre">Nombre *</FieldLabel>
                <Input id="dir-nombre" {...field} placeholder="Casa Central" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="direccion"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dir-direccion">Dirección *</FieldLabel>
                <Input
                  id="dir-direccion"
                  {...field}
                  placeholder="Av. Siempre Viva 123"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={form.control}
              name="piso"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="dir-piso">Piso</FieldLabel>
                  <Input id="dir-piso" {...field} placeholder="Piso 5" value={field.value ?? ""} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="oficina"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="dir-oficina">Oficina</FieldLabel>
                  <Input id="dir-oficina" {...field} placeholder="Oficina 502" value={field.value ?? ""} />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={form.control}
              name="comuna"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="dir-comuna">Comuna</FieldLabel>
                  <Input id="dir-comuna" {...field} placeholder="Santiago" value={field.value ?? ""} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="ciudad"
              render={({ field }) => (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="dir-ciudad">Ciudad</FieldLabel>
                  <Input id="dir-ciudad" {...field} placeholder="Santiago" value={field.value ?? ""} />
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="activo"
            render={({ field }) => (
              <Field orientation="horizontal" className="gap-2">
                <Switch id="dir-activo" checked={field.value ?? true} onCheckedChange={field.onChange} />
                <FieldLabel htmlFor="dir-activo" className="mb-0">Activo</FieldLabel>
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="direccion-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear dirección"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
