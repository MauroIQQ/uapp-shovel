"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LandingConfig } from "@/lib/landing-config";
import { StepSelectDate } from "./step-select-date";
import { StepPatientForm } from "./step-patient-form";
import { createBooking } from "@/lib/booking-actions";
import type { CreateBookingInput } from "@/lib/booking-actions";
import { CheckCircle2, Calendar, User } from "lucide-react";

interface BookingFlowProps {
  config: LandingConfig
}

type Step = "date" | "form" | "confirm";

export function BookingFlow({ config }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleDateSelected = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep("form");
  };

  const handleSubmit = async (data: {
    rut_paciente: string
    nombre_completo: string
    telefono: string
    correo?: string
    id_prevision?: number
  }) => {
    setError(null);

    const fechaHora = `${selectedDate}T${selectedTime}:00.000-04:00`;

    const input: CreateBookingInput = {
      rut_empresa: config.rut_empresa,
      fecha_hora: fechaHora,
      ...data,
    };

    const result = await createBooking(input);

    if (result.ok) {
      setStep("confirm");
      setTimeout(() => {
        router.push(`/${config.slug}/agendar/success`);
      }, 1500);
    } else {
      setError(result.error ?? "Error al crear la reserva");
    }
  };

  const steps = [
    { id: "date" as const, label: "Fecha y Hora", icon: Calendar },
    { id: "form" as const, label: "Tus Datos", icon: User },
    { id: "confirm" as const, label: "Confirmación", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= currentStepIndex;
          const isCurrent = i === currentStepIndex;
          return (
            <div key={s.id} className="flex items-center">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? `${config.theme.primary}15` : "transparent",
                  color: isActive ? config.theme.primary : "#9ca3af",
                  border: isCurrent ? `2px solid ${config.theme.primary}` : "2px solid transparent",
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-8 h-px mx-1"
                  style={{ backgroundColor: isActive ? config.theme.primary : "#e5e7eb" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {step === "date" && (
        <StepSelectDate
          rutEmpresa={config.rut_empresa}
          theme={config.theme}
          onSelect={handleDateSelected}
        />
      )}

      {step === "form" && (
        <StepPatientForm
          rutEmpresa={config.rut_empresa}
          theme={config.theme}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSubmit={handleSubmit}
          onBack={() => setStep("date")}
        />
      )}

      {step === "confirm" && (
        <div className="text-center py-16">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${config.theme.primary}15` }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: config.theme.primary }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h2>
          <p className="text-gray-600">Redirigiendo a la confirmación...</p>
        </div>
      )}
    </div>
  );
}
