"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { crearDiaBloqueadoSchema, type DiaBloqueadoFormData } from "../domain/dia-bloqueado.schema";
import { createDiaBloqueado } from "../infrastructure/dias-bloqueados.service";

interface DiaBloqueadoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DiaBloqueadoFormSheet({ open, onOpenChange, onSuccess }: DiaBloqueadoFormSheetProps) {
  const [saving, setSaving] = React.useState(false);

  const form = useForm<DiaBloqueadoFormData>({
    resolver: zodResolver(crearDiaBloqueadoSchema) as never,
    defaultValues: { fecha: "", motivo: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ fecha: "", motivo: "" });
  }, [open, form]);

  async function onSubmit(data: DiaBloqueadoFormData) {
    setSaving(true);
    try {
      await createDiaBloqueado(data);
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
          <SheetTitle>Nuevo día bloqueado</SheetTitle>
          <SheetDescription>Selecciona la fecha y opcionalmente agrega un motivo.</SheetDescription>
        </SheetHeader>

        <form
          id="db-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="fecha"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel>Fecha</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      aria-invalid={fieldState.invalid}
                    >
                      <CalendarDays className="mr-2 size-4 shrink-0" />
                      {field.value ? (
                        format(new Date(`${field.value}T12:00:00`), "PPP", { locale: es })
                      ) : (
                        <span className="text-muted-foreground">Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(`${field.value}T12:00:00`) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString().slice(0, 10) : "")}
                    />
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="motivo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="db-motivo">Motivo (opcional)</FieldLabel>
                <Textarea
                  id="db-motivo"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="db-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            Bloquear día
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
