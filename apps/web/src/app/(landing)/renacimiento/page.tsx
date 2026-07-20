import Link from "next/link";
import { getLandingConfig } from "@/lib/landing-config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarCheck,
  Stethoscope,
  Heart,
  Clock,
  Shield,
  UserCheck,
  ArrowRight,
  Star,
} from "lucide-react";

const config = getLandingConfig("renacimiento")!;
const { theme, name, slogan, contact } = config;

const services = [
  {
    icon: Stethoscope,
    title: "Medicina General",
    desc: "Atención primaria y preventiva para toda la familia.",
  },
  {
    icon: Heart,
    title: "Cardiología",
    desc: "Evaluación y seguimiento de la salud cardiovascular.",
  },
  {
    icon: UserCheck,
    title: "Pediatría",
    desc: "Cuidado especializado para niños y adolescentes.",
  },
  {
    icon: Shield,
    title: "Medicina Preventiva",
    desc: "Chequeos y exámenes preventivos anuales.",
  },
];

const benefits = [
  {
    icon: CalendarCheck,
    title: "Reserva Online",
    desc: "Agenda tu hora en segundos, sin llamadas ni esperas.",
  },
  {
    icon: Clock,
    title: "Horarios Flexibles",
    desc: "Atención continua con horarios extendidos y sábados.",
  },
  {
    icon: Shield,
    title: "Profesionales Certificados",
    desc: "Médicos especialistas con amplia experiencia.",
  },
];

const testimonials = [
  {
    name: "María González",
    text: "Excelente atención, muy profesionales y cálidos. La reserva online es muy práctica.",
    rating: 5,
  },
  {
    name: "Carlos Muñoz",
    text: "Llevo años viniendo, el equipo médico es de primer nivel. Muy recomendado.",
    rating: 5,
  },
  {
    name: "Ana Soto",
    text: "Agendar hora fue muy fácil y me atendieron puntualmente. Muy satisfecha.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "¿Cómo puedo reservar una hora?",
    a: "Puedes reservar online a través de nuestro sitio web seleccionando la fecha y horario disponible. Es rápido y no requiere registro.",
  },
  {
    q: "¿Cuánto tiempo dura la consulta?",
    a: "Las consultas de medicina general tienen una duración aproximada de 30 minutos. Especialidades pueden variar.",
  },
  {
    q: "¿Aceptan todas las previsiones?",
    a: "Trabajamos con las principales previsiones de salud del país. Consulta la lista completa al momento de agendar.",
  },
  {
    q: "¿Puedo cancelar o reagendar mi hora?",
    a: "Sí, puedes cancelar o reagendar tu hora contactándonos con al menos 24 horas de anticipación.",
  },
];

export default function RenacimientoPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {slogan}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mb-8 leading-relaxed">
              {config.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                <Link href={`/${config.slug}/agendar`}>
                  Reservar Hora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
<Button asChild size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
  <Link href={`/${config.slug}#servicios`}>Conoce Más</Link>
</Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white" />
      </section>

      <section id="servicios" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos atención médica integral con especialistas comprometidos en tu bienestar.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: theme.primaryLight }}
                    >
                      <Icon className="h-6 w-6" style={{ color: theme.primary }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-600">{s.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reservar tu hora nunca fue tan fácil. Solo tres pasos simples.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Elige Fecha y Hora", desc: "Selecciona el día y horario disponible que mejor te acomode." },
              { step: "2", title: "Ingresa tus Datos", desc: "Completa tus datos personales para confirmar la reserva." },
              { step: "3", title: "Recibe Confirmación", desc: "Recibirás la confirmación de tu hora agendada." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold"
                  style={{ backgroundColor: theme.primary }}
                >
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" style={{ backgroundColor: theme.primary }} className="text-white">
              <Link href={`/${config.slug}/agendar`}>Reservar Hora Ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">¿Por Qué Elegirnos?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Más de 10 años cuidando la salud de nuestra comunidad.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: theme.primaryLight }}
                  >
                    <Icon className="h-7 w-7" style={{ color: theme.primary }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-600">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Lo Que Dicen Nuestros Pacientes</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" style={{ color: theme.primary }} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            Preguntas Frecuentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium text-gray-900">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section
        className="py-20 sm:py-28"
        style={{ background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)` }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Listo para Agendar tu Hora?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            No esperes más, reserva tu consulta en segundos.
          </p>
          <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
            <Link href={`/${config.slug}/agendar`}>
              Reservar Hora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
