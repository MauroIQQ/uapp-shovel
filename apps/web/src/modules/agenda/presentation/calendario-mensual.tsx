"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ResumenMes } from "../domain/agenda.entity";

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface CalendarioMensualProps {
  resumen: ResumenMes[];
  loading: boolean;
  onMesChange: (year: number, month: number) => void;
  onDayClick: (fecha: string) => void;
  selectedFecha?: string;
}

export function CalendarioMensual({
  resumen,
  loading,
  onMesChange,
  onDayClick,
  selectedFecha,
}: CalendarioMensualProps) {
  const todayStr = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );
  const [viewYear, setViewYear] = React.useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = React.useState(new Date().getMonth());

  const resumenMap = React.useMemo(() => {
    const countMap = new Map<string, number>();
    const blockedMap = new Map<string, string | null>();
    for (const r of resumen) {
      countMap.set(r.fecha, r.count);
      if (r.bloqueado) blockedMap.set(r.fecha, r.motivo ?? null);
    }
    return { countMap, blockedMap };
  }, [resumen]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const startOffset = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const weeks: { day: number; dateStr: string; isOutside: boolean }[][] = [];
  let row: { day: number; dateStr: string; isOutside: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    row.push({ day: d, dateStr, isOutside: true });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    row.push({ day: d, dateStr, isOutside: false });
    if (row.length === 7) {
      weeks.push(row);
      row = [];
    }
  }

  if (row.length > 0) {
    let nextDay = 1;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    while (row.length < 7) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
      row.push({ day: nextDay, dateStr, isOutside: true });
      nextDay++;
    }
    weeks.push(row);
  }

  // Notify parent of initial month on mount
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      onMesChange(viewYear, viewMonth + 1);
    }
  }, [viewYear, viewMonth, onMesChange]);

  function goPrevMonth() {
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    setViewYear(y);
    setViewMonth(m);
    onMesChange(y, m + 1);
  }

  function goNextMonth() {
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    setViewYear(y);
    setViewMonth(m);
    onMesChange(y, m + 1);
  }

  function goToday() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onMesChange(now.getFullYear(), now.getMonth() + 1);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            data-slot="button"
            data-variant="outline"
            data-size="xs"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-xs font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground h-7 gap-1"
            onClick={goToday}
          >
            Hoy
          </button>
          <div className="flex items-center">
            <button
              data-slot="button"
              data-variant="ghost"
              data-size="icon-xs"
              className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground size-7"
              onClick={goPrevMonth}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              data-slot="button"
              data-variant="ghost"
              data-size="icon-xs"
              className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground size-7"
              onClick={goNextMonth}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <h2 className="text-sm font-semibold sm:text-base">
            {MONTHS[viewMonth]} {viewYear}
          </h2>
        </div>
      </div>

      {loading && (
        <div className="mb-1 text-center text-xs text-muted-foreground">
          Cargando...
        </div>
      )}

      {/* Day headers */}
      <div className="grid grid-cols-7 border-border/70 border-b">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-1.5 text-center text-[11px] font-medium text-muted-foreground/70"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid auto-rows-fr" style={{ "--event-height": "24px", "--event-gap": "4px" } as React.CSSProperties}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 [&:last-child>*]:border-b-0">
            {week.map((cell) => {
              const count = resumenMap.countMap.get(cell.dateStr) ?? 0;
              const isBlocked = resumenMap.blockedMap.has(cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedFecha;

              return (
                <div
                  key={cell.dateStr}
                  data-outside-cell={cell.isOutside ? true : undefined}
                  data-today={isToday ? true : undefined}
                  className={cn(
                    "group border-border/70 border-r border-b last:border-r-0 cursor-pointer transition-colors hover:bg-muted/20",
                    cell.isOutside && "bg-muted/25 text-muted-foreground/70",
                    isSelected && "bg-primary/[0.04] ring-1 ring-inset ring-primary/30",
                    isBlocked && "bg-destructive/5 hover:bg-destructive/10",
                  )}
                  onClick={() => onDayClick(cell.dateStr)}
                >
                  <div className="flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1">
                    <span
                      className={cn(
                        "mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm",
                        isToday &&
                          "bg-primary text-primary-foreground font-semibold",
                        isBlocked && "text-destructive/70 line-through",
                      )}
                    >
                      {cell.day}
                    </span>
                    <div
                      className="flex flex-col gap-[var(--event-gap)] min-h-[calc((var(--event-height)+var(--event-gap))*1)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*2)]"
                    >
                      {isBlocked && (
                        <div
                          className="mt-[var(--event-gap)] flex h-[var(--event-height)] items-center overflow-hidden rounded px-1.5 text-[10px] font-medium sm:text-xs bg-destructive/15 text-destructive"
                        >
                          <span className="truncate">Bloqueado</span>
                        </div>
                      )}
                      {!isBlocked && count > 0 && (
                        <div
                          className={cn(
                            "mt-[var(--event-gap)] flex h-[var(--event-height)] items-center overflow-hidden rounded px-1.5 text-[10px] font-medium backdrop-blur-md sm:text-xs",
                            "bg-primary/10 text-primary/80",
                          )}
                        >
                          <span className="truncate">
                            {count} {count === 1 ? "cita" : "citas"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
