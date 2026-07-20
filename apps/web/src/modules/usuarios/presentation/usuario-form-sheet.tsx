"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PERFIL_NOMBRES, Perfil } from "@uapp/shared";
import { Building2, Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import type { Usuario } from "../domain/usuario.entity";
import { actualizarUsuarioSchema, crearUsuarioSchema, type UsuarioFormData } from "../domain/usuario.schema";
import { createUsuario, updateUsuario } from "../infrastructure/usuarios.service";

interface EmpresaOption {
  rut_empresa: string;
  giro: string | null;
}

interface UsuarioFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario | null;
  onSuccess: () => void;
}

export function UsuarioFormSheet({ open, onOpenChange, usuario, onSuccess }: UsuarioFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const [empresas, setEmpresas] = React.useState<EmpresaOption[]>([]);

  const isEditing = !!usuario;

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(isEditing ? actualizarUsuarioSchema : crearUsuarioSchema) as never,
    defaultValues: {
      rut: "",
      nombre: "",
      paterno: "",
      materno: null,
      perfil: Perfil.Asistente,
      correo: null,
      password: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      fetch("/api/empresas")
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((json) => setEmpresas(json.data ?? []))
        .catch(() => setEmpresas([]));
      if (usuario) {
        form.reset({
          rut: usuario.rut,
          nombre: usuario.nombre,
          paterno: usuario.paterno,
          materno: usuario.materno,
          perfil: usuario.perfil as Perfil,
          correo: usuario.correo ?? null,
          password: "",
        });
      } else {
        form.reset({
          rut: "",
          nombre: "",
          paterno: "",
          materno: null,
          perfil: Perfil.Asistente,
          correo: null,
          password: "",
        });
      }
    }
  }, [open, usuario, form]);

  async function onSubmit(data: UsuarioFormData) {
    setSaving(true);
    try {
      if (isEditing) {
        const { password, ...rest } = data;
        await updateUsuario(usuario?.rut, password ? { ...rest, password } : rest);
      } else {
        await createUsuario(data);
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
          <SheetTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Modifica los datos del usuario" : "Ingresa los datos del nuevo usuario"}
          </SheetDescription>
        </SheetHeader>

        <form
          id="usuario-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <Controller
            control={form.control}
            name="rut"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="usuario-rut">RUT</FieldLabel>
                <Input
                  {...field}
                  id="usuario-rut"
                  placeholder="12.345.678-9"
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
            name="nombre"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="usuario-nombre">Nombre</FieldLabel>
                <Input
                  {...field}
                  id="usuario-nombre"
                  placeholder="Nombre del usuario"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="paterno"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="usuario-paterno">Apellido paterno</FieldLabel>
                <Input
                  {...field}
                  id="usuario-paterno"
                  placeholder="Apellido paterno"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="materno"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="usuario-materno">Apellido materno</FieldLabel>
                <Input
                  {...field}
                  id="usuario-materno"
                  placeholder="Apellido materno (opcional)"
                  value={field.value ?? ""}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="perfil"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="usuario-perfil">Perfil</FieldLabel>
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger id="usuario-perfil" className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PERFIL_NOMBRES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="rut_empresa"
            render={({ field }) => (
              <Field className="gap-1.5">
                <FieldLabel htmlFor="usuario-empresa">Empresa</FieldLabel>
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger id="usuario-empresa" className="w-full">
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.rut_empresa} value={e.rut_empresa}>
                        <span className="flex items-center gap-2">
                          <Building2 className="size-3" />
                          {e.giro || e.rut_empresa}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="correo"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="usuario-correo">Correo</FieldLabel>
                <Input
                  {...field}
                  id="usuario-correo"
                  type="email"
                  placeholder="usuario@correo.cl"
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="usuario-password">
                  {isEditing ? "Contraseña (dejar en blanco para mantener)" : "Contraseña"}
                </FieldLabel>
                <Input
                  {...field}
                  id="usuario-password"
                  type="password"
                  placeholder={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="usuario-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
