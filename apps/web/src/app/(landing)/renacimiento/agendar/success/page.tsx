import { getLandingConfig } from "@/lib/landing-config";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const config = getLandingConfig("renacimiento")!;

export const metadata = {
  title: `Reserva Confirmada - ${config.name}`,
};

export default function SuccessPage() {
  const { theme } = config;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${theme.primary}15` }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: theme.primary }} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Hora Confirmada!</h1>
        <p className="text-gray-600 mb-8">
          Tu reserva se ha realizado con éxito. Recibirás los detalles de tu cita por los medios
          registrados.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${config.slug}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-white transition-colors"
            style={{ backgroundColor: theme.primary }}
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
