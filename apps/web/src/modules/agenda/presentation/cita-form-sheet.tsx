"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { validarRut } from "@uapp/shared";
import { format } from "date-fns";
import { AlertTriangle, CalendarDays, Loader2, Save, Search, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { AgendaCita, HorarioSlot, TipoHora } from "../domain/agenda.entity";
import { type CrearCitaFormData, crearCitaSchema } from "../domain/agenda.schema";
import {
  buscarPaciente,
  crearPacienteInline,
  createCita,
  fetchPrevisiones,
  updateCita,
} from "../infrastructure/agenda.service";
import { checkBlacklistStatus } from "@/lib/blacklist-actions";
import type { BlacklistStatus } from "@/lib/blacklist-actions";
import { useAuth } from "@/lib/auth-context";

interface CitaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cita?: AgendaCita | null;
  fecha?: string;
  tipos: TipoHora[];
  horarios: HorarioSlot[];
  onSuccess: () => void;
}

export function CitaFormSheet({ open, onOpenChange, cita, fecha, tipos, horarios, onSuccess }: CitaFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [previsiones, setPrevisiones] = React.useState<{ id: number; nombre: string }[]>([]);
  const isEditing = !!cita;

  const [rutBusqueda, setRutBusqueda] = React.useState("");
  const [rutError, setRutError] = React.useState<string | null>(null);
  const [buscando, setBuscando] = React.useState(false);
  const [pacienteEncontrado, setPacienteEncontrado] = React.useState<Record<string, unknown> | null | undefined>(
    undefined,
  );
  const [nuevoPaciente, setNuevoPaciente] = React.useState({
    nombre_completo: "",
    telefono: "",
    celular: "",
    correo: "",
    extranjero: false,
  });
  const [blacklistStatus, setBlacklistStatus] = React.useState<BlacklistStatus | null>(null);
  const { user: authUser } = useAuth();

  const form = useForm<CrearCitaFormData>({
    resolver: zodResolver(crearCitaSchema) as never,
    defaultValues: {
      rut_paciente: "",
      fecha: fecha ?? "",
      hora: "",
      id_tipo_consulta: undefined as unknown as number,
      id_prevision: undefined as unknown as number,
      observacion: "",
      confirmada: "false",
      sobrecupo: false,
      num_llegada: undefined,
    },
  });

  const [horasBloqueadasFecha, setHorasBloqueadasFecha] = React.useState<Set<string>>(new Set());

  const fechaWatch = form.watch("fecha");

  React.useEffect(() => {
    if (fechaWatch) {
      fetch(`/api/horas-bloqueadas?fecha=${fechaWatch}`)
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((json) => setHorasBloqueadasFecha(new Set((json.data ?? []).map((h: { hora: string }) => h.hora))))
        .catch(() => setHorasBloqueadasFecha(new Set()));
    } else {
      setHorasBloqueadasFecha(new Set());
    }
  }, [fechaWatch]);

  const horariosDisponibles = React.useMemo(
    () => horarios.filter((h) => !horasBloqueadasFecha.has(h.hora.slice(0, 5))),
    [horarios, horasBloqueadasFecha],
  );

  React.useEffect(() => {
    if (open) {
      fetchPrevisiones()
        .then(setPrevisiones)
        .catch(() => {});
      if (cita) {
        const d = new Date(cita.fecha_hora);
        const dateStr = d.toISOString().slice(0, 10);
        const timeStr = d.toTimeString().slice(0, 5);
        setRutBusqueda(cita.rut_paciente);
        setPacienteEncontrado({ rut: cita.rut_paciente, nombre_completo: cita.paciente_nombre });
        setBlacklistStatus(null);
        if (authUser) {
          checkBlacklistStatus(authUser.rut_empresa, cita.rut_paciente).then(setBlacklistStatus).catch(() => {});
        }
        form.reset({
          rut_paciente: cita.rut_paciente,
          fecha: dateStr,
          hora: timeStr,
          id_tipo_consulta: cita.id_tipo_consulta,
          id_prevision: cita.id_prevision ?? (undefined as unknown as number),
          observacion: cita.observacion ?? "",
          confirmada: cita.confirmada ?? "false",
          sobrecupo: cita.sobrecupo,
          num_llegada: cita.num_llegada,
        });
      } else {
        setRutBusqueda("");
        setRutError(null);
        setSubmitError(null);
        setPacienteEncontrado(undefined);
        setBlacklistStatus(null);
        setNuevoPaciente({ nombre_completo: "", telefono: "", celular: "", correo: "", extranjero: false });
        form.reset({
          rut_paciente: "",
          fecha: fecha ?? "",
          hora: "",
          id_tipo_consulta: undefined as unknown as number,
          id_prevision: undefined as unknown as number,
          observacion: "",
          confirmada: "false",
          sobrecupo: false,
          num_llegada: undefined,
        });
      }
    }
  }, [open, cita, fecha, form]);

  async function handleBuscar() {
    const rut = rutBusqueda.trim();
    if (!rut) return;

    if (!nuevoPaciente.extranjero) {
      if (!validarRut(rut)) {
        setRutError("RUT inválido (dígito verificador incorrecto)");
        setPacienteEncontrado(undefined);
        return;
      }
    }

    setRutError(null);
    setSubmitError(null);
    setBuscando(true);
    setPacienteEncontrado(undefined);
    try {
      const p = await buscarPaciente(rut);
      if (p) {
        setPacienteEncontrado(p);
        form.setValue("rut_paciente", rut);
        if (authUser) {
          checkBlacklistStatus(authUser.rut_empresa, rut).then(setBlacklistStatus).catch(() => {});
        }
      } else {
        setPacienteEncontrado(null);
        form.setValue("rut_paciente", rut);
      }
    } catch {
      setPacienteEncontrado(null);
    } finally {
      setBuscando(false);
    }
  }

  async function onSubmit(data: CrearCitaFormData) {
    if (!isEditing) {
      if (pacienteEncontrado === undefined) {
        setSubmitError("Debe buscar un paciente por RUT antes de guardar");
        return;
      }
      if (pacienteEncontrado === null) {
        if (!nuevoPaciente.extranjero && !validarRut(data.rut_paciente)) {
          setSubmitError("RUT inválido (dígito verificador incorrecto)");
          return;
        }
        if (!nuevoPaciente.nombre_completo.trim()) {
          setSubmitError("Debe ingresar el nombre del paciente");
          return;
        }
      }
    }

    if (!data.hora) {
      setSubmitError("Debe seleccionar una hora");
      return;
    }
    if (!data.id_tipo_consulta || data.id_tipo_consulta <= 0) {
      setSubmitError("Debe seleccionar un tipo de consulta");
      return;
    }

    setSubmitError(null);
    setSaving(true);
    try {
      if (isEditing) {
        await updateCita(cita?.id, data);
      } else {
        if (!pacienteEncontrado) {
          await crearPacienteInline({
            rut: data.rut_paciente,
            ...nuevoPaciente,
            estado: "activo",
          });
        }
        await createCita(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      // handled by caller
    } finally {
      setSaving(false);
    }
  }

  const pacienteVisible = pacienteEncontrado !== undefined;
  const pacienteExiste = pacienteEncontrado !== null && pacienteEncontrado !== undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar cita" : "Nueva cita"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Modifica los datos de la cita"
              : "Busca un paciente por RUT o ingresa los datos para crear uno nuevo"}
          </SheetDescription>
        </SheetHeader>

        {submitError && (
          <div className="mx-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
            {submitError}
          </div>
        )}

        <form
          id="cita-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          {/* Búsqueda de paciente (solo en creación) */}
          {!isEditing && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <h4 className="mb-3 font-semibold text-sm">Datos del Paciente</h4>

              <Field className="gap-1.5">
                <FieldLabel htmlFor="rut-busqueda">RUT del paciente</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="rut-busqueda"
                    placeholder="Ej: 12345678-9"
                    className="flex-1"
                    value={rutBusqueda}
                    onChange={(e) => {
                      setRutBusqueda(e.target.value);
                      setRutError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleBuscar();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={buscando || !rutBusqueda.trim()}
                    onClick={handleBuscar}
                  >
                    {buscando ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  </Button>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Switch
                      id="cita-extranjero"
                      checked={nuevoPaciente.extranjero}
                      onCheckedChange={(checked) => setNuevoPaciente((p) => ({ ...p, extranjero: checked }))}
                    />
                    <label
                      htmlFor="cita-extranjero"
                      className="cursor-pointer select-none whitespace-nowrap text-muted-foreground text-sm"
                    >
                      Extranjero
                    </label>
                  </div>
                </div>
                {rutError && <p className="text-destructive text-xs">{rutError}</p>}
              </Field>

              {pacienteVisible && pacienteExiste && (
                <div className="mt-3 rounded-md border bg-card p-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <UserPlus className="size-4" />
                    <span className="font-medium">Paciente encontrado</span>
                  </div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Nombre:</span>{" "}
                      {(pacienteEncontrado as Record<string, unknown>).nombre_completo as string}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">RUT:</span>{" "}
                      {(pacienteEncontrado as Record<string, unknown>).rut as string}
                    </p>
                  </div>
                  {blacklistStatus?.blacklisted && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <p className="font-medium">Paciente en lista negra</p>
                        <p className="text-xs">{blacklistStatus.no_show_count} inasistencias registradas</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {pacienteVisible && !pacienteExiste && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-md border bg-amber-50 p-3 text-amber-700 text-sm dark:bg-amber-950/20 dark:text-amber-400">
                    Paciente no encontrado. Completa los datos para crearlo.
                  </div>
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="np-nombre">Nombre completo</FieldLabel>
                    <Input
                      id="np-nombre"
                      placeholder="Nombre del paciente"
                      value={nuevoPaciente.nombre_completo}
                      onChange={(e) => setNuevoPaciente((p) => ({ ...p, nombre_completo: e.target.value }))}
                    />
                  </Field>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="np-telefono">Teléfono</FieldLabel>
                      <Input
                        id="np-telefono"
                        placeholder="Teléfono"
                        value={nuevoPaciente.telefono}
                        onChange={(e) => setNuevoPaciente((p) => ({ ...p, telefono: e.target.value }))}
                      />
                    </Field>
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="np-celular">Celular</FieldLabel>
                      <Input
                        id="np-celular"
                        placeholder="Celular"
                        value={nuevoPaciente.celular}
                        onChange={(e) => setNuevoPaciente((p) => ({ ...p, celular: e.target.value }))}
                      />
                    </Field>
                  </div>
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="np-correo">Correo</FieldLabel>
                    <Input
                      id="np-correo"
                      type="email"
                      placeholder="correo@ejemplo.cl"
                      value={nuevoPaciente.correo}
                      onChange={(e) => setNuevoPaciente((p) => ({ ...p, correo: e.target.value }))}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Edición: RUT del paciente en readonly */}
          {isEditing && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <h4 className="mb-3 font-semibold text-sm">Datos del Paciente</h4>
              <Field className="gap-1.5">
                <FieldLabel>RUT del paciente</FieldLabel>
                <Input value={cita?.rut_paciente} disabled />
              </Field>
            </div>
          )}

          {/* Datos de la Cita */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-3 font-semibold text-sm">Datos de la Cita</h4>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
                              format(new Date(`${field.value}T12:00:00`), "dd/MM/yy")
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
                      <FieldLabel htmlFor="cita-hora">Hora</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="cita-hora" className="w-full" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Seleccionar hora..." />
                        </SelectTrigger>
                        <SelectContent>
                          {horariosDisponibles.length > 0 ? (
                            horariosDisponibles.map((h) => (
                              <SelectItem key={h.id} value={h.hora.slice(0, 5)}>
                                {h.hora.slice(0, 5)}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                              No hay horarios disponibles para esta fecha
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="id_tipo_consulta"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cita-tipo">Tipo de consulta</FieldLabel>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="cita-tipo" className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Seleccionar tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tipos.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.descripcion}
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
                name="id_prevision"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cita-prevision">Previsión</FieldLabel>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(v ? Number(v) : (undefined as unknown as number))}
                    >
                      <SelectTrigger id="cita-prevision" className="w-full">
                        <SelectValue placeholder="Sin previsión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin previsión</SelectItem>
                        {previsiones.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.nombre}
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
                name="observacion"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cita-obs">Observación</FieldLabel>
                    <Textarea
                      id="cita-obs"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={3}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={form.control}
                  name="num_llegada"
                  render={({ field }) => (
                    <Field className="gap-1.5">
                      <FieldLabel>N° Llegada</FieldLabel>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="sobrecupo"
                  render={({ field }) => (
                    <Field orientation="horizontal" className="gap-2 self-end pb-1.5">
                      <Switch id="cita-sobrecupo" checked={field.value ?? false} onCheckedChange={field.onChange} />
                      <FieldLabel htmlFor="cita-sobrecupo">Sobrecupo</FieldLabel>
                    </Field>
                  )}
                />
              </div>

              <div className="flex gap-6">
                <Controller
                  control={form.control}
                  name="confirmada"
                  render={({ field }) => (
                    <Field orientation="horizontal" className="gap-2">
                      <Switch
                        id="cita-confirmada"
                        checked={field.value === "SI"}
                        onCheckedChange={(c) => field.onChange(c ? "SI" : "NO")}
                      />
                      <FieldLabel htmlFor="cita-confirmada">Confirmado</FieldLabel>
                    </Field>
                  )}
                />
                {isEditing && (
                  <Controller
                    control={form.control}
                    name="atendido"
                    render={({ field }) => (
                      <Field orientation="horizontal" className="gap-2">
                        <Switch
                          id="cita-atendido"
                          checked={field.value === "SI"}
                          onCheckedChange={(c) => field.onChange(c ? "SI" : "NO")}
                        />
                        <FieldLabel htmlFor="cita-atendido">Atendido</FieldLabel>
                      </Field>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="cita-form" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            {isEditing ? "Guardar cambios" : "Crear cita"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
