"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { crearPacienteSchema, type PacienteFormData } from "../domain/paciente.schema";
import type { Paciente } from "../domain/paciente.entity";
import { createPaciente, updatePaciente, fetchPrevisiones } from "../infrastructure/pacientes.service";

interface PacienteFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente?: Paciente | null;
  onSuccess: () => void;
}

export function PacienteFormSheet({ open, onOpenChange, paciente, onSuccess }: PacienteFormSheetProps) {
  const [previsiones, setPrevisiones] = React.useState<{ id: number; nombre: string }[]>([]);
  const [saving, setSaving] = React.useState(false);

  const isEditing = !!paciente;

  const form = useForm<PacienteFormData>({
    resolver: zodResolver(crearPacienteSchema) as never,
    defaultValues: {
      rut: "",
      extranjero: false,
      nombre_completo: "",
      sexo: null,
      fecha_nacimiento: null,
      telefono: null,
      celular: null,
      correo: null,
      direccion: null,
      id_prevision: null,
      estado: "activo",
    },
  });

  React.useEffect(() => {
    if (open) {
      fetchPrevisiones().then(setPrevisiones).catch(() => {});
      if (paciente) {
        form.reset({
          rut: paciente.rut,
          extranjero: paciente.extranjero ?? false,
          nombre_completo: paciente.nombre_completo,
          sexo: (paciente.sexo as "Masculino" | "Femenino" | "Otro") ?? null,
          fecha_nacimiento: paciente.fecha_nacimiento?.split("T")[0] ?? null,
          telefono: paciente.telefono,
          celular: paciente.celular,
          correo: paciente.correo ?? null,
          direccion: paciente.direccion,
          id_prevision: paciente.id_prevision,
          estado: (paciente.estado as "activo" | "inactivo") ?? "activo",
        });
      } else {
        form.reset({
          rut: "",
          extranjero: false,
          nombre_completo: "",
          sexo: null,
          fecha_nacimiento: null,
          telefono: null,
          celular: null,
          correo: null,
          direccion: null,
          id_prevision: null,
          estado: "activo",
        });
      }
    }
  }, [open, paciente, form]);

  async function onSubmit(data: PacienteFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        await updatePaciente(paciente!.rut, data);
      } else {
        await createPaciente(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      // error handled by caller
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar Paciente" : "Nuevo Paciente"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Modifica los datos del paciente"
              : "Ingresa los datos del nuevo paciente"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="paciente-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="rut"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="paciente-rut">RUT</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    {...field}
                    id="paciente-rut"
                    placeholder={form.watch("extranjero") ? "ID / Pasaporte" : "12.345.678-9"}
                    aria-invalid={fieldState.invalid}
                    disabled={isEditing}
                    value={field.value ?? ""}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch
                      id="paciente-extranjero"
                      checked={form.watch("extranjero") ?? false}
                      onCheckedChange={(v) => form.setValue("extranjero", v)}
                    />
                    <label
                      htmlFor="paciente-extranjero"
                      className="text-sm cursor-pointer select-none text-muted-foreground whitespace-nowrap"
                    >
                      Extranjero
                    </label>
                  </div>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="nombre_completo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="paciente-nombre">Nombre completo</FieldLabel>
                <Input
                  {...field}
                  id="paciente-nombre"
                  placeholder="Nombre del paciente"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="sexo"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-sexo">Sexo</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || null)}
                >
                  <SelectTrigger id="paciente-sexo" className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-fecha">Fecha de nacimiento</FieldLabel>
                <Input
                  {...field}
                  id="paciente-fecha"
                  type="date"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-telefono">Teléfono</FieldLabel>
                <Input
                  {...field}
                  id="paciente-telefono"
                  placeholder="+56 9 1234 5678"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="celular"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-celular">Celular</FieldLabel>
                <Input
                  {...field}
                  id="paciente-celular"
                  placeholder="+56 9 1234 5678"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="correo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="paciente-correo">Correo</FieldLabel>
                <Input
                  {...field}
                  id="paciente-correo"
                  type="email"
                  placeholder="paciente@correo.cl"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="direccion"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-direccion">Dirección</FieldLabel>
                <Input
                  {...field}
                  id="paciente-direccion"
                  placeholder="Dirección del paciente"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="id_prevision"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-prevision">Previsión</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                >
                  <SelectTrigger id="paciente-prevision" className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {previsiones.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="estado"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="paciente-estado">Estado</FieldLabel>
                <Select
                  value={field.value ?? "activo"}
                  onValueChange={(v) => field.onChange(v)}
                >
                  <SelectTrigger id="paciente-estado" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="paciente-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear paciente"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
