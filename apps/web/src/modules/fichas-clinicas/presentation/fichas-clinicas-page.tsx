"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

import { ListaPacientesFicha } from "./lista-pacientes-ficha";
import type { PacienteDia } from "./lista-pacientes-ficha";

export function FichasClinicasPage() {
  const [fecha, setFecha] = React.useState<Date>(new Date());
  const [pacientes, setPacientes] = React.useState<PacienteDia[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function load(f: Date) {
    setLoading(true);
    try {
      const ymd = format(f, "yyyy-MM-dd");
      const res = await fetch(`/api/agenda?fecha=${ymd}`);
      if (!res.ok) {
        setPacientes([]);
        return;
      }
      const json = await res.json();
      setPacientes(
        (json.data ?? []).map((c: Record<string, unknown>) => ({
          rut: c.rut_paciente as string,
          nombre: c.paciente_nombre as string,
          hora: c.fecha_hora as string,
          tipo_consulta: c.tipo_descripcion as string,
          prevision: (c.prevision_nombre as string | null) ?? null,
          confirmada: (c.confirmada as string | null) ?? null,
          origen: (c.origen as string | null) ?? null,
        })),
      );
    } catch {
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(fecha);
  }, [fecha]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarDays className="size-4" />
              {format(fecha, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={(d) => d && setFecha(d)}
            />
          </PopoverContent>
        </Popover>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando pacientes...</span>
          </div>
        )}
      </div>
      <ListaPacientesFicha pacientes={pacientes} />
    </div>
  );
}
