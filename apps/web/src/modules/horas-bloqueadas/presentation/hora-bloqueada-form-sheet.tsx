"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarDays, Clock, Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { crearHoraBloqueadaSchema, type HoraBloqueadaFormData } from "../domain/hora-bloqueada.schema";
import { createHoraBloqueada } from "../infrastructure/horas-bloqueadas.service";

interface HoraBloqueadaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const HORAS = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

export function HoraBloqueadaFormSheet({ open, onOpenChange, onSuccess }: HoraBloqueadaFormSheetProps) {
  const [saving, setSaving] = React.useState(false);

  const form = useForm<HoraBloqueadaFormData>({
    resolver: zodResolver(crearHoraBloqueadaSchema) as never,
    defaultValues: { fecha: "", hora: "", motivo: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ fecha: "", hora: "", motivo: "" });
  }, [open, form]);

  async function onSubmit(data: HoraBloqueadaFormData) {
    setSaving(true);
    try {
      await createHoraBloqueada(data);
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
          <SheetTitle>Nuevo horario bloqueado</SheetTitle>
          <SheetDescription>Selecciona la fecha, hora y opcionalmente agrega un motivo.</SheetDescription>
        </SheetHeader>

        <form
          id="hb-form"
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
            name="hora"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="hb-hora">Hora</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="hb-hora" className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Seleccionar hora...">
                      {field.value && (
                        <span className="flex items-center gap-2">
                          <Clock className="size-4" />
                          {field.value}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {HORAS.map((h) => (
                      <SelectItem key={h} value={h}>
                        <span className="flex items-center gap-2">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {h}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="motivo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="hb-motivo">Motivo (opcional)</FieldLabel>
                <Textarea
                  id="hb-motivo"
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
          <Button type="submit" form="hb-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            Bloquear horario
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
