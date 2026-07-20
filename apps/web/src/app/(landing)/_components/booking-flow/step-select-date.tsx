"use client";

import { useState, useEffect, useCallback } from "react";
import { getAvailableSlots } from "@/lib/booking-actions";
import type { AvailableSlot } from "@/lib/booking-actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";

interface StepSelectDateProps {
  rutEmpresa: string
  theme: { primary: string; primaryLight: string }
  onSelect: (date: string, time: string) => void
}

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export function StepSelectDate({ rutEmpresa, theme, onSelect }: StepSelectDateProps) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const days = generateCalendarDays(year, month);

  const isPast = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
  const isMax = year > maxDate.getFullYear() || (year === maxDate.getFullYear() && month > maxDate.getMonth());
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const loadSlots = useCallback(async (dateStr: string) => {
    setLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);
    const result = await getAvailableSlots(rutEmpresa, dateStr);
    setSlots(result.slots);
    if (result.error) setSlotsError(result.error);
    setLoading(false);
  }, [rutEmpresa]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate, loadSlots]);

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const canGoBack = !(year === today.getFullYear() && month === today.getMonth());
  const canGoForward = !(year === maxDate.getFullYear() && month === maxDate.getMonth());

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona una fecha</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => { setYear(month === 0 ? year - 1 : year); setMonth(month === 0 ? 11 : month - 1); setSelectedDate(null); }}
              disabled={!canGoBack}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold text-gray-900">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => { setYear(month === 11 ? year + 1 : year); setMonth(month === 11 ? 0 : month + 1); setSelectedDate(null); }}
              disabled={!canGoForward}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-xs font-medium text-gray-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPastDay = isCurrentMonth && day < today.getDate();
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const disabled = isPast || isPastDay;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={`
                    h-9 w-full rounded-lg text-sm font-medium transition-all
                    ${disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                    ${isToday && !isSelected ? "ring-2 ring-offset-1" : ""}
                    ${isSelected ? "text-white" : ""}
                  `}
                  style={isSelected ? { backgroundColor: theme.primary } : {}}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un horario</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-4 min-h-[200px]">
          {!selectedDate && (
            <p className="text-gray-500 text-sm text-center py-12">Selecciona una fecha primero</p>
          )}

          {selectedDate && loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: theme.primary }} />
            </div>
          )}

          {selectedDate && !loading && slotsError && (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">{slotsError}</p>
            </div>
          )}

          {selectedDate && !loading && !slotsError && slots.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No hay horas disponibles para esta fecha</p>
            </div>
          )}

          {selectedDate && !loading && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`
                    py-2.5 px-3 rounded-lg text-sm font-medium border transition-all
                    ${selectedSlot === slot.time ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:border-gray-300"}
                  `}
                  style={selectedSlot === slot.time ? { backgroundColor: theme.primary, borderColor: theme.primary } : {}}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full mt-4 h-11 text-base"
          disabled={!selectedDate || !selectedSlot || loading}
          style={{ backgroundColor: theme.primary }}
          onClick={() => selectedDate && selectedSlot && onSelect(selectedDate, selectedSlot)}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
