"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarDays, CheckIcon, Loader2, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useBuscarMedicamentos } from "@/modules/medicamentos/application/buscar-medicamentos.use-case";
import type { Medicamento } from "@/modules/medicamentos/domain/medicamento.entity";

import {
  crearBitacora,
  actualizarBitacora,
  crearDiagnostico,
  actualizarDiagnostico,
  eliminarDiagnostico,
  fetchDiagnosticos,
  crearReceta,
  eliminarReceta,
  fetchRecetas,
  fetchBitacoraCompleta,
} from "../../infrastructure/fichas.service";
import type { CrearBitacoraData } from "../../domain/ficha.schema";

interface BitacoraFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fichaId: number;
  onSuccess: () => void;
  bitacoraId?: number;
}

interface DiagnosticFormItem {
  id?: number;
  codigo_cie10: string;
  diagnostico: string;
  principal: boolean;
}

interface RecetaDetalleFormItem {
  id?: number;
  medicamento: string;
  concentracion: string;
  forma_farmaceutica: string;
  presentacion: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  cantidad: string;
  via_administracion: string;
  indicaciones: string;
  observaciones: string;
}

interface RecetaFormItem {
  id?: number;
  validez: string;
  estado: string;
  observaciones: string;
  detalle: RecetaDetalleFormItem[];
}

interface BitacoraFormValues {
  motivo_consulta: string;
  enfermedad_actual: string;
  presion_sistolica: string;
  presion_diastolica: string;
  pulso: string;
  frecuencia_respiratoria: string;
  saturacion_o2: string;
  temperatura: string;
  glicemia: string;
  peso: string;
  talla: string;
  imc: string;
  perimetro_abdominal: string;
  examen_fisico: string;
  anamnesis: string;
  diagnosticos: DiagnosticFormItem[];
  plan_terapeutico: string;
  indicaciones: string;
  recetas: RecetaFormItem[];
  proximo_control_fecha: string;
  proximo_control_motivo: string;
}

const defaultValues: BitacoraFormValues = {
  motivo_consulta: "",
  enfermedad_actual: "",
  presion_sistolica: "",
  presion_diastolica: "",
  pulso: "",
  frecuencia_respiratoria: "",
  saturacion_o2: "",
  temperatura: "",
  glicemia: "",
  peso: "",
  talla: "",
  imc: "",
  perimetro_abdominal: "",
  examen_fisico: "",
  anamnesis: "",
  diagnosticos: [],
  plan_terapeutico: "",
  indicaciones: "",
  recetas: [],
  proximo_control_fecha: "",
  proximo_control_motivo: "",
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function DiagnosticoItem({
  index,
  control,
  remove,
}: {
  index: number;
  control: ReturnType<typeof useForm<BitacoraFormValues>>["control"];
  remove: () => void;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Diagnóstico #{index + 1}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={remove}>
          <Trash2 className="size-3 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name={`diagnosticos.${index}.codigo_cie10`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Código CIE-10</FieldLabel>
              <Input {...field} value={field.value ?? ""} placeholder="Ej: E11.9" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`diagnosticos.${index}.diagnostico`}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel>Diagnóstico</FieldLabel>
              <Input {...field} placeholder="Diagnóstico" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        control={control}
        name={`diagnosticos.${index}.principal`}
        render={({ field }) => (
          <Field orientation="horizontal" className="mt-2 gap-2">
            <Switch
              id={`dx-principal-${index}`}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <FieldLabel htmlFor={`dx-principal-${index}`}>Principal</FieldLabel>
          </Field>
        )}
      />
    </div>
  );
}

function RecetaDetalleItem({
  recetaIndex,
  index,
  control,
  remove,
  medicamentos,
}: {
  recetaIndex: number;
  index: number;
  control: ReturnType<typeof useForm<BitacoraFormValues>>["control"];
  remove: () => void;
  medicamentos: Medicamento[];
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const debouncedSearch = useDebouncedValue(searchText, 150);
  const filteredMedicamentos = React.useMemo(
    () => medicamentos
      .filter((m) => m.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .slice(0, 20),
    [medicamentos, debouncedSearch],
  );

  return (
    <div className="rounded-md border bg-muted/10 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Detalle #{index + 1}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={remove}>
          <Trash2 className="size-3 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.medicamento`}
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel>Medicamento</FieldLabel>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverAnchor asChild>
                  <div>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Medicamento"
                      onChange={(e) => {
                        field.onChange(e);
                        setSearchText(e.target.value);
                        setPopoverOpen(e.target.value.length > 0);
                      }}
                      onBlur={() => {
                        field.onBlur();
                        setTimeout(() => setPopoverOpen(false), 200);
                      }}
                    />
                  </div>
                </PopoverAnchor>
                {filteredMedicamentos.length > 0 && (
                  <PopoverContent className="p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Command>
                      <CommandList>
                        <CommandEmpty>Sin resultados</CommandEmpty>
                        <CommandGroup>
                          {filteredMedicamentos.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={m.nombre}
                              onSelect={(value) => {
                                field.onChange(value);
                                setPopoverOpen(false);
                              }}
                            >
                              <CheckIcon className="size-4 opacity-0 group-data-[selected]/command-item:opacity-100" />
                              {m.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.concentracion`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Concentración</FieldLabel>
              <Input {...field} value={field.value ?? ""} placeholder="Ej: 500 mg" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.dosis`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Dosis</FieldLabel>
              <Input {...field} value={field.value ?? ""} placeholder="Ej: 1 comprimido" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.frecuencia`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Frecuencia</FieldLabel>
              <Input {...field} value={field.value ?? ""} placeholder="Ej: Cada 8 hrs" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.duracion`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Duración</FieldLabel>
              <Input {...field} value={field.value ?? ""} placeholder="Ej: 7 días" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.cantidad`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Cantidad</FieldLabel>
              <Input type="number" {...field} value={field.value ?? ""} placeholder="Ej: 30" />
            </Field>
          )}
        />
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.detalle.${index}.via_administracion`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Vía</FieldLabel>
              <Input {...field} value={field.value ?? ""} placeholder="Ej: Oral" />
            </Field>
          )}
        />
      </div>
    </div>
  );
}

function RecetaItem({
  recetaIndex,
  control,
  remove,
  medicamentos,
}: {
  recetaIndex: number;
  control: ReturnType<typeof useForm<BitacoraFormValues>>["control"];
  remove: () => void;
  medicamentos: Medicamento[];
}) {
  const detachField = useFieldArray({
    control,
    name: `recetas.${recetaIndex}.detalle`,
  });

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Receta #{recetaIndex + 1}
        </span>
        <Button type="button" variant="ghost" size="icon" onClick={remove}>
          <Trash2 className="size-3 text-destructive" />
        </Button>
      </div>
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name={`recetas.${recetaIndex}.validez`}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel>Validez</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ej: 30 días"
              />
            </Field>
          )}
        />
      </div>

      <div className="space-y-3">
        {detachField.fields.map((detField, detIndex) => (
          <RecetaDetalleItem
            key={detField.id}
            recetaIndex={recetaIndex}
            index={detIndex}
            control={control}
            remove={() => detachField.remove(detIndex)}
            medicamentos={medicamentos}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() =>
          detachField.append({
            medicamento: "",
            concentracion: "",
            forma_farmaceutica: "",
            presentacion: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
            cantidad: "",
            via_administracion: "",
            indicaciones: "",
            observaciones: "",
          })
        }
      >
        <Plus className="size-3" />
        Agregar detalle
      </Button>
    </div>
  );
}

export function BitacoraFormSheet({
  open,
  onOpenChange,
  fichaId,
  onSuccess,
  bitacoraId,
}: BitacoraFormSheetProps) {
  const [saving, setSaving] = React.useState(false);
  const [loadingEdit, setLoadingEdit] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const { data: medicamentos } = useBuscarMedicamentos();

  const form = useForm<BitacoraFormValues>({
    defaultValues,
  });

  const {
    fields: dxFields,
    append: appendDx,
    remove: removeDx,
  } = useFieldArray({ control: form.control, name: "diagnosticos" });

  const {
    fields: recetaFields,
    append: appendReceta,
    remove: removeReceta,
  } = useFieldArray({ control: form.control, name: "recetas" });

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues);
      setSubmitError(null);
      if (bitacoraId) {
        setLoadingEdit(true);
        fetchBitacoraCompleta(bitacoraId)
          .then((b) => {
            form.reset({
              motivo_consulta: b.motivo_consulta,
              enfermedad_actual: b.enfermedad_actual ?? "",
              presion_sistolica: b.presion_sistolica?.toString() ?? "",
              presion_diastolica: b.presion_diastolica?.toString() ?? "",
              pulso: b.pulso?.toString() ?? "",
              frecuencia_respiratoria: b.frecuencia_respiratoria?.toString() ?? "",
              saturacion_o2: b.saturacion_o2?.toString() ?? "",
              temperatura: b.temperatura ?? "",
              glicemia: b.glicemia ?? "",
              peso: b.peso ?? "",
              talla: b.talla ?? "",
              imc: b.imc ?? "",
              perimetro_abdominal: b.perimetro_abdominal ?? "",
              examen_fisico: b.examen_fisico ?? "",
              anamnesis: b.anamnesis ?? "",
              diagnosticos: (b.diagnosticos ?? []).map((d) => ({
                id: d.id,
                codigo_cie10: d.codigo_cie10 ?? "",
                diagnostico: d.diagnostico,
                principal: d.principal,
              })),
              plan_terapeutico: b.plan_terapeutico ?? "",
              indicaciones: b.indicaciones ?? "",
              recetas: (b.recetas ?? []).map((r) => ({
                id: r.id,
                validez: r.validez ?? "",
                estado: r.estado ?? "",
                observaciones: r.observaciones ?? "",
                detalle: r.detalle.map((d) => ({
                  id: d.id,
                  medicamento: d.medicamento,
                  concentracion: d.concentracion ?? "",
                  forma_farmaceutica: d.forma_farmaceutica ?? "",
                  presentacion: d.presentacion ?? "",
                  dosis: d.dosis ?? "",
                  frecuencia: d.frecuencia ?? "",
                  duracion: d.duracion ?? "",
                  cantidad: d.cantidad?.toString() ?? "",
                  via_administracion: d.via_administracion ?? "",
                  indicaciones: d.indicaciones ?? "",
                  observaciones: d.observaciones ?? "",
                })),
              })),
              proximo_control_fecha: b.proximo_control_fecha ?? "",
              proximo_control_motivo: b.proximo_control_motivo ?? "",
            });
          })
          .catch(() => setSubmitError("Error al cargar datos de la atención"))
          .finally(() => setLoadingEdit(false));
      }
    }
  }, [open, bitacoraId, form]);

  async function persistDiagnosticos(bitacoraIdInterno: number, diagnosticos: DiagnosticFormItem[]) {
    if (bitacoraId) {
      const existing = await fetchDiagnosticos(bitacoraIdInterno);
      const idsEnForm = new Set(diagnosticos.map((d) => d.id).filter(Boolean));
      await Promise.all(
        existing.filter((d) => !idsEnForm.has(d.id)).map((d) => eliminarDiagnostico(d.id)),
      );
    }
    for (const d of diagnosticos) {
      if (!d.diagnostico?.trim()) continue;
      if (d.id) {
        await actualizarDiagnostico(d.id, {
          codigo_cie10: d.codigo_cie10 || null,
          diagnostico: d.diagnostico.trim(),
          principal: d.principal,
          observaciones: null,
        });
      } else {
        await crearDiagnostico(bitacoraIdInterno, {
          codigo_cie10: d.codigo_cie10 || null,
          diagnostico: d.diagnostico.trim(),
          principal: d.principal,
          observaciones: null,
        });
      }
    }
  }

  async function persistRecetas(bitacoraIdInterno: number, recetas: RecetaFormItem[]) {
    if (bitacoraId) {
      const existing = await fetchRecetas(bitacoraIdInterno);
      const idsEnForm = new Set(recetas.map((r) => r.id).filter(Boolean));
      await Promise.all(
        existing.filter((r) => !idsEnForm.has(r.id)).map((r) => eliminarReceta(r.id)),
      );
    }
    for (const r of recetas) {
      if (!r.detalle.some((d) => d.medicamento?.trim())) continue;
      if (r.id) continue;
      await crearReceta(bitacoraIdInterno, {
        validez: r.validez || null,
        estado: r.estado || null,
        observaciones: r.observaciones || null,
        detalle: r.detalle
          .filter((d) => d.medicamento?.trim())
          .map((d) => ({
            medicamento: d.medicamento?.trim() ?? "",
            concentracion: d.concentracion || null,
            forma_farmaceutica: d.forma_farmaceutica || null,
            presentacion: d.presentacion || null,
            dosis: d.dosis || null,
            frecuencia: d.frecuencia || null,
            duracion: d.duracion || null,
            cantidad: d.cantidad ? Number(d.cantidad) : null,
            via_administracion: d.via_administracion || null,
            indicaciones: d.indicaciones || null,
            observaciones: d.observaciones || null,
          })),
      });
    }
  }

  async function onSubmit(data: BitacoraFormValues) {
    console.log("[BitacoraFormSheet] onSubmit iniciado", { motivo: data.motivo_consulta?.slice(0, 30), recetas: data.recetas?.length, diagnosticos: data.diagnosticos?.length });

    if (!data.motivo_consulta.trim()) {
      setSubmitError("El motivo de consulta es requerido");
      return;
    }

    setSubmitError(null);
    setSaving(true);
    try {
      const payload: CrearBitacoraData = {
        motivo_consulta: data.motivo_consulta.trim(),
        enfermedad_actual: data.enfermedad_actual || null,
        presion_sistolica: data.presion_sistolica ? Number(data.presion_sistolica) : null,
        presion_diastolica: data.presion_diastolica ? Number(data.presion_diastolica) : null,
        pulso: data.pulso ? Number(data.pulso) : null,
        frecuencia_respiratoria: data.frecuencia_respiratoria ? Number(data.frecuencia_respiratoria) : null,
        saturacion_o2: data.saturacion_o2 ? Number(data.saturacion_o2) : null,
        temperatura: data.temperatura || null,
        glicemia: data.glicemia || null,
        peso: data.peso || null,
        talla: data.talla || null,
        imc: data.imc || null,
        perimetro_abdominal: data.perimetro_abdominal || null,
        examen_fisico: data.examen_fisico || null,
        anamnesis: data.anamnesis || null,
        plan_terapeutico: data.plan_terapeutico || null,
        indicaciones: data.indicaciones || null,
        proximo_control_fecha: data.proximo_control_fecha || null,
        proximo_control_motivo: data.proximo_control_motivo || null,
      };

      if (bitacoraId) {
        await actualizarBitacora(bitacoraId, payload);
        await persistDiagnosticos(bitacoraId, data.diagnosticos);
        await persistRecetas(bitacoraId, data.recetas);
      } else {
        const created = await crearBitacora(fichaId, payload);
        console.log("[BitacoraFormSheet] created completo:", JSON.stringify(created));
        console.log("[BitacoraFormSheet] created.id:", created?.id);

        if (!created?.id) {
          throw new Error("La API no retornó un ID de bitácora");
        }

        console.log("[BitacoraFormSheet] Guardando diagnósticos...");
        await persistDiagnosticos(created.id, data.diagnosticos);

        console.log("[BitacoraFormSheet] Guardando recetas...");
        try {
          await persistRecetas(created.id, data.recetas);
          console.log("[BitacoraFormSheet] Recetas guardadas OK");
        } catch (err) {
          console.error("[BitacoraFormSheet] Error específico en persistRecetas:", err);
          throw err;
        }
      }
      onSuccess();
    } catch (e) {
      console.error("Error al guardar bitácora:", e);
      setSubmitError("Error al guardar la bitácora");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:sm:max-w-[767px]">
        <SheetHeader>
          <SheetTitle>{bitacoraId ? "Editar Atención" : "Nueva Atención"}</SheetTitle>
          <SheetDescription>
            {bitacoraId ? "Modifica los datos de la atención registrada" : "Registra una nueva atención o bitácora clínica"}
          </SheetDescription>
        </SheetHeader>

        {submitError && (
          <div className="mx-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {loadingEdit && (
          <div className="mx-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span>Cargando datos de la atención...</span>
            </div>
          </div>
        )}

        <form
          id="bitacora-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          {/* Motivo + Enfermedad actual */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-3 text-sm font-semibold">Motivo de Consulta</h4>
            <div className="space-y-3">
              <Controller
                control={form.control}
                name="motivo_consulta"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="mc-motivo">Motivo de consulta</FieldLabel>
                    <Textarea
                      id="mc-motivo"
                      {...field}
                      rows={2}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="enfermedad_actual"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="mc-enf-actual">Enfermedad actual</FieldLabel>
                    <Textarea
                      id="mc-enf-actual"
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Signos vitales */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-3 text-sm font-semibold">Signos Vitales</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Controller
                control={form.control}
                name="presion_sistolica"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>PA Sistólica</FieldLabel>
                    <Input type="number" {...field} value={field.value ?? ""} placeholder="mmHg" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="presion_diastolica"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>PA Diastólica</FieldLabel>
                    <Input type="number" {...field} value={field.value ?? ""} placeholder="mmHg" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="pulso"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>Pulso</FieldLabel>
                    <Input type="number" {...field} value={field.value ?? ""} placeholder="lpm" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="frecuencia_respiratoria"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>FR</FieldLabel>
                    <Input type="number" {...field} value={field.value ?? ""} placeholder="rpm" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="saturacion_o2"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>SatO₂</FieldLabel>
                    <Input type="number" {...field} value={field.value ?? ""} placeholder="%" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="temperatura"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>Temperatura</FieldLabel>
                    <Input {...field} value={field.value ?? ""} placeholder="°C" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="glicemia"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>Glicemia</FieldLabel>
                    <Input {...field} value={field.value ?? ""} placeholder="mg/dL" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>Peso</FieldLabel>
                    <Input {...field} value={field.value ?? ""} placeholder="kg" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="talla"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>Talla</FieldLabel>
                    <Input {...field} value={field.value ?? ""} placeholder="cm" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="imc"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>IMC</FieldLabel>
                    <Input {...field} value={field.value ?? ""} placeholder="kg/m²" />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="perimetro_abdominal"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel>Perímetro Abdominal</FieldLabel>
                    <Input {...field} value={field.value ?? ""} placeholder="cm" />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Examen físico + Anamnesis */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-3 text-sm font-semibold">Evaluación</h4>
            <div className="space-y-3">
              <Controller
                control={form.control}
                name="examen_fisico"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="ef-examen">Examen físico</FieldLabel>
                    <Textarea
                      id="ef-examen"
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="anamnesis"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="ef-anamnesis">Anamnesis</FieldLabel>
                    <Textarea
                      id="ef-anamnesis"
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Diagnósticos */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Diagnósticos</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendDx({ codigo_cie10: "", diagnostico: "", principal: false })
                }
              >
                <Plus className="size-3" />
                Agregar
              </Button>
            </div>
            <div className="space-y-3">
              {dxFields.map((field, index) => (
                <DiagnosticoItem
                  key={field.id}
                  index={index}
                  control={form.control}
                  remove={() => removeDx(index)}
                />
              ))}
              {dxFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay diagnósticos registrados
                </p>
              )}
            </div>
          </div>

          {/* Plan terapéutico + Indicaciones */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-3 text-sm font-semibold">Plan e Indicaciones</h4>
            <div className="space-y-3">
              <Controller
                control={form.control}
                name="plan_terapeutico"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="plan-tx">Plan terapéutico</FieldLabel>
                    <Textarea
                      id="plan-tx"
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="indicaciones"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="plan-indicaciones">Indicaciones</FieldLabel>
                    <Textarea
                      id="plan-indicaciones"
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Recetas */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Recetas</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendReceta({
                    validez: "",
                    estado: "",
                    observaciones: "",
                    detalle: [
                      {
                        medicamento: "",
                        concentracion: "",
                        forma_farmaceutica: "",
                        presentacion: "",
                        dosis: "",
                        frecuencia: "",
                        duracion: "",
                        cantidad: "",
                        via_administracion: "",
                        indicaciones: "",
                        observaciones: "",
                      },
                    ],
                  })
                }
              >
                <Plus className="size-3" />
                Agregar Receta
              </Button>
            </div>
            <div className="space-y-4">
              {recetaFields.map((recetaField, recetaIndex) => (
                <RecetaItem
                  key={recetaField.id}
                  recetaIndex={recetaIndex}
                  control={form.control}
                  remove={() => removeReceta(recetaIndex)}
                  medicamentos={medicamentos}
                />
              ))}
              {recetaFields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay recetas registradas
                </p>
              )}
            </div>
          </div>

          {/* Próximo control */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <h4 className="mb-3 text-sm font-semibold">Próximo Control</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <Controller
                control={form.control}
                name="proximo_control_fecha"
                render={({ field }) => (
                  <Field className="gap-1.5 sm:col-span-2">
                    <FieldLabel>Fecha</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarDays className="mr-2 size-4 shrink-0" />
                          {field.value ? (
                            format(new Date(field.value + "T12:00:00"), "dd/MM/yy")
                          ) : (
                            <span className="text-muted-foreground">Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString().slice(0, 10) : "")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="proximo_control_motivo"
                render={({ field }) => (
                  <Field className="gap-1.5 sm:col-span-3">
                    <FieldLabel htmlFor="pc-motivo">Motivo</FieldLabel>
                    <Input
                      id="pc-motivo"
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Motivo del próximo control"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </form>

        <SheetFooter className="px-4">
          <Button type="submit" form="bitacora-form" disabled={saving || loadingEdit}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            Guardar atención
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
