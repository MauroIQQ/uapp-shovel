"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Earth } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PacienteDia {
  rut: string;
  nombre: string;
  hora: string;
  tipo_consulta: string;
  prevision: string | null;
  confirmada: string | null;
  origen: string | null;
}

interface ListaPacientesFichaProps {
  pacientes: PacienteDia[];
}

export function ListaPacientesFicha({ pacientes }: ListaPacientesFichaProps) {
  const router = useRouter();
  const [filtro, setFiltro] = React.useState("confirmados");

  const filtrados = React.useMemo(() => {
    if (filtro === "confirmados") return pacientes.filter((p) => p.confirmada === "SI");
    return pacientes;
  }, [pacientes, filtro]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Fichas Clínicas</h1>
          <p className="text-sm text-muted-foreground">
            Pacientes agendados para hoy — {filtrados.length} paciente{filtrados.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Tabs value={filtro} onValueChange={setFiltro}>
          <TabsList>
            <TabsTrigger value="todos" className="px-3">Todos</TabsTrigger>
            <TabsTrigger value="confirmados" className="px-3">Confirmados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtrados.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
          No hay pacientes agendados para hoy
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((p) => {
            const hora = new Date(p.hora).toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <button
                key={`${p.rut}-${p.hora}`}
                type="button"
                onClick={() => router.push(`/dashboard/fichas/${p.rut}?nombre=${encodeURIComponent(p.nombre)}`)}
                className="flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-[60px] flex-col items-center">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{hora}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.nombre}</span>
                    {p.origen === "web" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-pointer">
                              <Earth className="size-3.5 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Agendada desde web</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.rut}</span>
                    <span>·</span>
                    <span>{p.tipo_consulta}</span>
                    {p.prevision && (
                      <>
                        <span>·</span>
                        <span>{p.prevision}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.confirmada === "SI" && (
                    <Badge variant="secondary">Confirmado</Badge>
                  )}
                  <CalendarDays className="size-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
