"use client";

import * as React from "react";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { FichaClinica } from "../../domain/ficha.entity";
import { actualizarFicha } from "../../infrastructure/fichas.service";

interface DatosGeneralesTabProps {
  ficha: FichaClinica;
  onUpdate: (data: Record<string, unknown>) => void;
}

const GRUPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const FACTORES_RH = ["Positivo", "Negativo"];
const GENEROS = ["Masculino", "Femenino", "Otro"];

export function DatosGeneralesTab({ ficha, onUpdate }: DatosGeneralesTabProps) {
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    grupo_sanguineo: ficha.grupo_sanguineo ?? "",
    factor_rh: ficha.factor_rh ?? "",
    donante_organos: ficha.donante_organos ?? false,
    genero: ficha.genero ?? "",
    ocupacion: ficha.ocupacion ?? "",
    contacto_emergencia_nombre: ficha.contacto_emergencia_nombre ?? "",
    contacto_emergencia_parentezco: ficha.contacto_emergencia_parentezco ?? "",
    contacto_emergencia_telefono: ficha.contacto_emergencia_telefono ?? "",
    contacto_emergencia_direccion: ficha.contacto_emergencia_direccion ?? "",
    observaciones_generales: ficha.observaciones_generales ?? "",
  });

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      await actualizarFicha(ficha.id, form);
      onUpdate(form);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Datos Generales</h2>
        <Button onClick={handleSubmit} disabled={saving}>
          <Save />
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field className="gap-1.5">
              <FieldLabel>Grupo Sanguíneo</FieldLabel>
              <Select value={form.grupo_sanguineo} onValueChange={(v) => set("grupo_sanguineo", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {GRUPOS_SANGUINEOS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel>Factor RH</FieldLabel>
              <Select value={form.factor_rh} onValueChange={(v) => set("factor_rh", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {FACTORES_RH.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel>Donante de Órganos</FieldLabel>
              <div className="flex items-center gap-2 pt-1.5">
                <Switch checked={form.donante_organos} onCheckedChange={(c) => set("donante_organos", c)} />
                <span className="text-muted-foreground text-sm">{form.donante_organos ? "Sí" : "No"}</span>
              </div>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel>Género</FieldLabel>
              <Select value={form.genero} onValueChange={(v) => set("genero", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {GENEROS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel>Ocupación</FieldLabel>
              <Input value={form.ocupacion} onChange={(e) => set("ocupacion", e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto de Emergencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel>Nombre</FieldLabel>
              <Input
                value={form.contacto_emergencia_nombre}
                onChange={(e) => set("contacto_emergencia_nombre", e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel>Parentesco</FieldLabel>
              <Input
                value={form.contacto_emergencia_parentezco}
                onChange={(e) => set("contacto_emergencia_parentezco", e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel>Teléfono</FieldLabel>
              <Input
                value={form.contacto_emergencia_telefono}
                onChange={(e) => set("contacto_emergencia_telefono", e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel>Dirección</FieldLabel>
              <Input
                value={form.contacto_emergencia_direccion}
                onChange={(e) => set("contacto_emergencia_direccion", e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones Generales</CardTitle>
        </CardHeader>
        <CardContent>
          <Field className="gap-1.5">
            <Textarea
              value={form.observaciones_generales}
              onChange={(e) => set("observaciones_generales", e.target.value)}
              rows={4}
            />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
