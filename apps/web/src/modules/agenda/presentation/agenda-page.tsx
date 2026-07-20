"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAgenda } from "../application/use-agenda";
import type { AgendaCita, HorarioSlot, ResumenMes, TipoHora } from "../domain/agenda.entity";
import { deleteCita, fetchResumenMes } from "../infrastructure/agenda.service";
import { CalendarioMensual } from "./calendario-mensual";
import { CitaFormSheet } from "./cita-form-sheet";
import { ListaCitas } from "./lista-citas";

interface AgendaPageProps {
  tipos: TipoHora[];
  horarios: HorarioSlot[];
  resumen: ResumenMes[];
}

export function AgendaPage({
  tipos: initialTipos,
  horarios: initialHorarios,
  resumen: initialResumen,
}: AgendaPageProps) {
  const [currentFecha, setCurrentFecha] = React.useState(new Date().toISOString().slice(0, 10));
  const [currentMes, setCurrentMes] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [resumen, setResumen] = React.useState(initialResumen);
  const [loadingResumen, setLoadingResumen] = React.useState(false);

  const { citas, loading, error, refresh } = useAgenda(currentFecha);
  const [filtroEstado, setFiltroEstado] = React.useState<"todos" | "confirmados" | "atendidos">("todos");
  const [filtroTurno, setFiltroTurno] = React.useState<"am" | "pm">(() => (new Date().getHours() < 12 ? "am" : "pm"));

  const citasFiltradas = React.useMemo(() => {
    let result = citas;

    if (filtroEstado === "confirmados") result = result.filter((c) => c.confirmada === "SI");
    else if (filtroEstado === "atendidos") result = result.filter((c) => c.atendido === "SI");

    if (filtroTurno === "am") result = result.filter((c) => new Date(c.fecha_hora).getHours() < 12);
    else result = result.filter((c) => new Date(c.fecha_hora).getHours() >= 12);

    return result;
  }, [citas, filtroEstado, filtroTurno]);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingCita, setEditingCita] = React.useState<AgendaCita | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AgendaCita | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [bloqueadoDialog, setBloqueadoDialog] = React.useState<{ fecha: string; motivo: string | null } | null>(null);

  const [tipos] = React.useState(initialTipos);
  const [horarios] = React.useState(initialHorarios);

  const mesStr = `${currentMes.year}-${String(currentMes.month).padStart(2, "0")}`;

  const resumenBloqueados = React.useMemo(() => {
    const map = new Map<string, string | null>();
    for (const r of resumen) {
      if (r.bloqueado) map.set(r.fecha, r.motivo ?? null);
    }
    return map;
  }, [resumen]);

  React.useEffect(() => {
    async function loadResumen() {
      setLoadingResumen(true);
      try {
        const data = await fetchResumenMes(mesStr);
        setResumen(data);
      } catch {
        // silent
      } finally {
        setLoadingResumen(false);
      }
    }
    loadResumen();
  }, [mesStr]);

  function handleMesChange(year: number, month: number) {
    setCurrentMes({ year, month });
  }

  function handleDayClick(fecha: string) {
    if (resumenBloqueados.has(fecha)) {
      setBloqueadoDialog({ fecha, motivo: resumenBloqueados.get(fecha) ?? null });
    } else {
      setCurrentFecha(fecha);
    }
  }

  function handleEdit(cita: AgendaCita) {
    setEditingCita(cita);
    setSheetOpen(true);
  }

  function handleAdd() {
    setEditingCita(null);
    setSheetOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCita(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Left: Calendar */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <Select
            value={filtroEstado}
            onValueChange={(v) => setFiltroEstado(v as "todos" | "confirmados" | "atendidos")}
          >
            <SelectTrigger size="sm" className="w-fit">
              <span className="text-muted-foreground">Estado:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="confirmados">Confirmados</SelectItem>
              <SelectItem value="atendidos">Atendidos</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={filtroTurno} onValueChange={(v) => setFiltroTurno(v as "am" | "pm")}>
            <TabsList>
              <TabsTrigger value="am" className="px-3">
                AM
              </TabsTrigger>
              <TabsTrigger value="pm" className="px-3">
                PM
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <CalendarioMensual
            resumen={resumen}
            loading={loadingResumen}
            onMesChange={handleMesChange}
            onDayClick={handleDayClick}
            selectedFecha={currentFecha}
          />
        </div>
      </div>

      {/* Right: Day list */}
      <div className="min-w-0 flex-1">
        <div className="h-full rounded-lg border bg-card p-4">
          <ListaCitas
            citas={citasFiltradas}
            loading={loading}
            fecha={currentFecha}
            onEdit={handleEdit}
            onDelete={(c) => setDeleteTarget(c)}
            onAdd={handleAdd}
          />
        </div>
      </div>

      {/* Form Sheet */}
      <CitaFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cita={editingCita}
        fecha={currentFecha}
        tipos={tipos}
        horarios={horarios}
        onSuccess={refresh}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cita de <strong>{deleteTarget?.paciente_nombre}</strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bloqueado Dialog */}
      <AlertDialog open={!!bloqueadoDialog} onOpenChange={(o) => !o && setBloqueadoDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Día bloqueado</AlertDialogTitle>
            <AlertDialogDescription>
              El día <strong>{bloqueadoDialog?.fecha}</strong> se encuentra bloqueado.
              {bloqueadoDialog?.motivo && (
                <>
                  <br />
                  <span className="text-muted-foreground">Motivo: {bloqueadoDialog.motivo}</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBloqueadoDialog(null)}>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
