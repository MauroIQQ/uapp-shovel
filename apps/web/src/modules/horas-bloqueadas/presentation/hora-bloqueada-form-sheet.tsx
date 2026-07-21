"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { CalendarDays, Clock, Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { crearHoraBloqueadaSchema, type HoraBloqueadaFormData } from "../domain/hora-bloqueada.schema";
import { createHorasBloqueadas } from "../infrastructure/horas-bloqueadas.service";

interface HoraBloqueadaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function HoraBloqueadaFormSheet({ open, onOpenChange, onSuccess }: HoraBloqueadaFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const [horarios, setHorarios] = React.useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = React.useState(false);

  const form = useForm<HoraBloqueadaFormData>({
    resolver: zodResolver(crearHoraBloqueadaSchema) as never,
    defaultValues: { fecha: "", horas: [], motivo: "" },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ fecha: "", horas: [], motivo: "" });
      setLoadingHorarios(true);
      fetch("/api/horarios")
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((json) => {
          const activos: string[] = (json.data ?? [])
            .filter((h: { activo: string }) => h.activo === "activo")
            .map((h: { hora: string }) => h.hora);
          setHorarios(activos);
        })
        .catch(() => setHorarios([]))
        .finally(() => setLoadingHorarios(false));
    }
  }, [open, form]);

  const selectedHoras = form.watch("horas");

  function toggleHora(hora: string) {
    const current = form.getValues("horas");
    if (current.includes(hora)) {
      form.setValue("horas", current.filter((h) => h !== hora), { shouldValidate: true });
    } else {
      form.setValue("horas", [...current, hora], { shouldValidate: true });
    }
  }

  async function onSubmit(data: HoraBloqueadaFormData) {
    setSaving(true);
    try {
      await createHorasBloqueadas(data.fecha, data.horas, data.motivo);
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
          <SheetDescription>Selecciona la fecha, uno o más horarios y opcionalmente un motivo.</SheetDescription>
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

          <Field className="gap-1.5">
            <FieldLabel>Horarios ({selectedHoras.length} seleccionados)</FieldLabel>
            {loadingHorarios ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                <Loader2 className="size-4 animate-spin" />
                Cargando horarios...
              </div>
            ) : horarios.length === 0 ? (
              <div className="py-4 text-muted-foreground text-sm">
                No hay horarios activos configurados
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 rounded-md border p-3">
                {horarios.map((hora) => (
                  <label
                    key={hora}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted has-data-[state=checked]:bg-primary/10"
                  >
                    <Checkbox
                      checked={selectedHoras.includes(hora)}
                      onCheckedChange={() => toggleHora(hora)}
                    />
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {hora}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {form.formState.errors.horas && (
              <p className="text-destructive text-xs">{form.formState.errors.horas.message}</p>
            )}
          </Field>

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
          <Button type="submit" form="hb-form" disabled={saving || selectedHoras.length === 0}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            Bloquear {selectedHoras.length > 0 ? `${selectedHoras.length} horario${selectedHoras.length !== 1 ? "s" : ""}` : "horarios"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
