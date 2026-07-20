"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Earth, FileText, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

import type { AgendaCita } from "../domain/agenda.entity";

interface ListaCitasProps {
  citas: AgendaCita[];
  loading: boolean;
  fecha: string;
  onEdit: (cita: AgendaCita) => void;
  onDelete: (cita: AgendaCita) => void;
  onAdd: () => void;
}

export function ListaCitas({
  citas,
  loading,
  fecha,
  onEdit,
  onDelete,
  onAdd,
}: ListaCitasProps) {
  const router = useRouter();
  const fechaFormateada = React.useMemo(() => {
    if (!fecha) return "";
    const d = new Date(fecha + "T12:00:00");
    return d.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [fecha]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold capitalize">{fechaFormateada}</h3>
          <p className="text-xs text-muted-foreground">
            {citas.length} cita{citas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          onClick={onAdd}
        >
          + Nueva cita
        </button>
      </div>

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-5" />
          <span>Cargando citas...</span>
        </div>
      )}

      {!loading && citas.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No hay citas para este día
        </div>
      )}

      {!loading && citas.length > 0 && (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {citas.map((cita) => {
            const hora = new Date(cita.fecha_hora).toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isActive = cita.estado === "activo";

            return (
              <div
                key={cita.id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  isActive
                    ? "hover:bg-muted/40"
                    : "bg-muted/20 opacity-60"
                }`}
              >
                <div className="flex min-w-[48px] flex-col items-center">
                  <span className="text-sm font-semibold">{hora}</span>
                  {!isActive && (
                    <span className="mt-0.5 rounded bg-destructive/10 px-1 text-[10px] text-destructive">
                      Inactivo
                    </span>
                  )}
                  {cita.origen === "web" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="mt-0.5 inline-flex size-3.5 cursor-pointer">
                            <Earth className="size-3.5 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Agendada desde web</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {cita.sobrecupo && (
                    <span className="mt-0.5 rounded bg-amber-100 px-1 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Sobrecupo
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{cita.paciente_nombre}</p>
                    {cita.num_llegada > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        N° {cita.num_llegada}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cita.tipo_descripcion}
                    {cita.prevision_nombre && ` · ${cita.prevision_nombre}`}
                  </p>
                </div>
                  <div className="flex items-center gap-3 self-center">
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id={`confirmada-${cita.id}`}
                        checked={cita.confirmada === "SI"}
                        disabled
                      />
                      <label
                        htmlFor={`confirmada-${cita.id}`}
                        className="text-xs text-muted-foreground select-none"
                      >
                        Confirmado
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id={`atendido-${cita.id}`}
                        checked={cita.atendido === "SI"}
                        disabled
                      />
                      <label
                        htmlFor={`atendido-${cita.id}`}
                        className="text-xs text-muted-foreground select-none"
                      >
                        Atendido
                      </label>
                    </div>
                  </div>
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label="Menú">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/fichas/${cita.rut_paciente}`)}>
                      <FileText className="mr-2 size-4" />
                      Ficha Clínica
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(cita)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(cita)}>
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
