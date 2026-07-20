"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPrevisiones, getPatientByRut } from "@/lib/booking-actions";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";

interface Prevision {
  id: number
  nombre: string
}

interface StepPatientFormProps {
  rutEmpresa: string
  theme: { primary: string; primaryLight: string }
  selectedDate: string
  selectedTime: string
  onSubmit: (data: {
    rut_paciente: string
    nombre_completo: string
    telefono: string
    correo?: string
    id_prevision?: number
  }) => Promise<void>
  onBack: () => void
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function StepPatientForm({
  rutEmpresa,
  theme,
  selectedDate,
  selectedTime,
  onSubmit,
  onBack,
}: StepPatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingRut, setLoadingRut] = useState(false);
  const [previsiones, setPrevisiones] = useState<Prevision[]>([]);
  const [rutLookedUp, setRutLookedUp] = useState(false);
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    telefono: "",
    correo: "",
    prevision: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getPrevisiones(rutEmpresa).then(setPrevisiones);
  }, [rutEmpresa]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.rut.trim()) errs.rut = "RUT es requerido";
    if (!formData.nombre.trim()) errs.nombre = "Nombre es requerido";
    if (!formData.telefono.trim()) errs.telefono = "Teléfono es requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRutBlur = async () => {
    const rut = formData.rut.trim()
    if (!rut || rut.length < 3) return

    setLoadingRut(true)
    const paciente = await getPatientByRut(rutEmpresa, rut)
    if (paciente) {
      setFormData((prev) => ({
        ...prev,
        nombre: paciente.nombre_completo,
        telefono: paciente.telefono ?? "",
        correo: paciente.correo ?? "",
        prevision: paciente.id_prevision ? String(paciente.id_prevision) : "",
      }))
      setRutLookedUp(true)
    } else {
      setRutLookedUp(false)
    }
    setLoadingRut(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSubmit({
      rut_paciente: formData.rut,
      nombre_completo: formData.nombre,
      telefono: formData.telefono,
      correo: formData.correo || undefined,
      id_prevision: formData.prevision ? Number(formData.prevision) : undefined,
    });
    setLoading(false);
  };

  return (
    <div>
      <div
        className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm"
        style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
      >
        <Calendar className="h-5 w-5 shrink-0" />
        <span className="font-medium capitalize">{formatDate(selectedDate)}</span>
        <Clock className="h-5 w-5 shrink-0 ml-2" />
        <span className="font-medium">{selectedTime} hrs</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="rut">RUT</Label>
          <div className="relative">
            <Input
              id="rut"
              placeholder="12.345.678-9"
              value={formData.rut}
              onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
              onBlur={handleRutBlur}
            />
            {loadingRut && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
            {rutLookedUp && !loadingRut && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
            )}
          </div>
          {errors.rut && <p className="text-xs text-red-500">{errors.rut}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo</Label>
          <Input
            id="nombre"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            placeholder="+56 9 1234 5678"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
          {errors.telefono && <p className="text-xs text-red-500">{errors.telefono}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="correo">Correo (opcional)</Label>
          <Input
            id="correo"
            type="email"
            placeholder="correo@ejemplo.cl"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prevision">Previsión (opcional)</Label>
          <Select
            value={formData.prevision}
            onValueChange={(v) => setFormData({ ...formData, prevision: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar previsión" />
            </SelectTrigger>
            <SelectContent>
              {previsiones.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button
            type="submit"
            className="flex-1 text-white"
            style={{ backgroundColor: theme.primary }}
            disabled={loading}
          >
            {loading ? "Reservando..." : "Confirmar Reserva"}
          </Button>
        </div>
      </form>
    </div>
  );
}
