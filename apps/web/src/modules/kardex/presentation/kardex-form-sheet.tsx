"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  type KardexFormData,
  crearArticuloSchema,
} from "../domain/kardex.schema";
import { createArticulo, updateArticulo } from "../infrastructure/kardex.service";
import type { KardexArticulo } from "../domain/kardex.entity";

interface KardexFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editItem?: KardexArticulo | null;
}

export function KardexFormSheet({
  open,
  onOpenChange,
  onSuccess,
  editItem,
}: KardexFormSheetProps) {
  const [saving, setSaving] = React.useState(false);

  const form = useForm<KardexFormData>({
    resolver: zodResolver(crearArticuloSchema) as never,
    defaultValues: { descripcion: "", stock_actual: 0 },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        descripcion: editItem?.descripcion ?? "",
        stock_actual: editItem?.stock_actual ?? 0,
      });
    }
  }, [open, editItem, form]);

  async function onSubmit(data: KardexFormData) {
    setSaving(true);
    try {
      if (editItem) {
        await updateArticulo(editItem.id_articulo, data);
      } else {
        await createArticulo(data);
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
          <SheetTitle>{editItem ? "Editar artículo" : "Nuevo artículo"}</SheetTitle>
          <SheetDescription>
            {editItem ? "Modifica la descripción o el stock del artículo." : "Agrega un nuevo artículo al kardex."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="kardex-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="descripcion"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="k-desc">Descripción</FieldLabel>
                <Input id="k-desc" value={field.value} onChange={field.onChange} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="stock_actual"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="k-stock">Stock actual</FieldLabel>
                <Input id="k-stock" type="number" min={0} value={field.value} onChange={field.onChange} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="kardex-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {editItem ? "Guardar cambios" : "Crear artículo"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
