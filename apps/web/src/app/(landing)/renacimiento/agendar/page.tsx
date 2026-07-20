import { getLandingConfig } from "@/lib/landing-config";
import { BookingFlow } from "../../_components/booking-flow/booking-flow";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const config = getLandingConfig("renacimiento")!;

export const metadata = {
  title: `Agendar Hora - ${config.name}`,
  description: `Reserva tu hora médica en ${config.name} de forma rápida y sencilla.`,
};

export default function AgendarPage() {
  const { theme } = config;

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href={`/${config.slug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Agenda tu Hora</h1>
          <p className="text-gray-600">Selecciona fecha, horario y completa tus datos.</p>
        </div>

        <div
          className="bg-white rounded-2xl border p-6 sm:p-8 shadow-sm"
          style={{ borderColor: `${theme.primary}20` }}
        >
          <BookingFlow config={config} />
        </div>
      </div>
    </div>
  );
}
