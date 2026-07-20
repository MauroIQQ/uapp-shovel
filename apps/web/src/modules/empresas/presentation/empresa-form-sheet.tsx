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

import type { Empresa } from "../domain/empresa.entity";
import { crearEmpresaSchema, type EmpresaFormData } from "../domain/empresa.schema";
import { createEmpresa, updateEmpresa } from "../infrastructure/empresas.service";

interface EmpresaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa?: Empresa | null;
  onSuccess: () => void;
}

export function EmpresaFormSheet({ open, onOpenChange, empresa, onSuccess }: EmpresaFormSheetProps) {
  const [saving, setSaving] = React.useState(false);

  const isEditing = !!empresa;

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(crearEmpresaSchema) as never,
    defaultValues: {
      rut_empresa: "",
      giro: null,
      direccion: null,
      correo: null,
      comuna: null,
      ciudad: null,
      telefono: null,
      celular: null,
      rut_representante: null,
      nombre_representante: null,
      estado: "activo",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (empresa) {
        form.reset({
          rut_empresa: empresa.rut_empresa,
          giro: empresa.giro,
          direccion: empresa.direccion,
          correo: empresa.correo,
          comuna: empresa.comuna,
          ciudad: empresa.ciudad,
          telefono: empresa.telefono,
          celular: empresa.celular,
          rut_representante: empresa.rut_representante,
          nombre_representante: empresa.nombre_representante,
          estado: (empresa.estado as "activo" | "inactivo") ?? "activo",
        });
      } else {
        form.reset({
          rut_empresa: "",
          giro: null,
          direccion: null,
          correo: null,
          comuna: null,
          ciudad: null,
          telefono: null,
          celular: null,
          rut_representante: null,
          nombre_representante: null,
          estado: "activo",
        });
      }
    }
  }, [open, empresa, form]);

  async function onSubmit(data: EmpresaFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        await updateEmpresa(empresa?.rut_empresa, data);
      } else {
        await createEmpresa(data);
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
          <SheetTitle>{isEditing ? "Editar Empresa" : "Nueva Empresa"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos de la empresa" : "Ingresa los datos de la nueva empresa"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="empresa-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="rut_empresa"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="empresa-rut">RUT Empresa</FieldLabel>
                <Input
                  {...field}
                  id="empresa-rut"
                  placeholder="76.140.290-0"
                  aria-invalid={fieldState.invalid}
                  disabled={isEditing}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="giro"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-giro">Giro</FieldLabel>
                <Input {...field} id="empresa-giro" placeholder="Giro de la empresa" value={field.value ?? ""} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="direccion"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-direccion">Dirección</FieldLabel>
                <Input {...field} id="empresa-direccion" placeholder="Dirección" value={field.value ?? ""} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="correo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="empresa-correo">Correo</FieldLabel>
                <Input
                  {...field}
                  id="empresa-correo"
                  type="email"
                  placeholder="empresa@correo.cl"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="comuna"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-comuna">Comuna</FieldLabel>
                <Input {...field} id="empresa-comuna" placeholder="Comuna" value={field.value ?? ""} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="ciudad"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-ciudad">Ciudad</FieldLabel>
                <Input {...field} id="empresa-ciudad" placeholder="Ciudad" value={field.value ?? ""} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-telefono">Teléfono</FieldLabel>
                <Input {...field} id="empresa-telefono" placeholder="+56 2 1234 5678" value={field.value ?? ""} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="celular"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-celular">Celular</FieldLabel>
                <Input {...field} id="empresa-celular" placeholder="+56 9 1234 5678" value={field.value ?? ""} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="rut_representante"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-rut-rep">RUT Representante</FieldLabel>
                <Input
                  {...field}
                  id="empresa-rut-rep"
                  placeholder="RUT del representante legal"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="nombre_representante"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-nombre-rep">Nombre Representante</FieldLabel>
                <Input
                  {...field}
                  id="empresa-nombre-rep"
                  placeholder="Nombre del representante legal"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="estado"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="empresa-estado">Estado</FieldLabel>
                <Select value={field.value ?? "activo"} onValueChange={(v) => field.onChange(v)}>
                  <SelectTrigger id="empresa-estado" className="w-full">
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
          <Button type="submit" form="empresa-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear empresa"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
