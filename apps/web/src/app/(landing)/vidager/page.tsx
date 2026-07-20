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
  Heart,
  Users,
  Home,
  Activity,
  Shield,
  Clock,
  CalendarCheck,
  ArrowRight,
  Star,
} from "lucide-react";

const config = getLandingConfig("vidager")!;
const { theme, name, slogan, contact } = config;

const services = [
  {
    icon: Heart,
    title: "Atención Geriátrica",
    desc: "Evaluación integral y seguimiento especializado para adultos mayores.",
  },
  {
    icon: Users,
    title: "Terapia Ocupacional",
    desc: "Actividades diseñadas para mantener y mejorar la autonomía.",
  },
  {
    icon: Home,
    title: "Cuidado Domiciliario",
    desc: "Atención profesional en la comodidad de tu hogar.",
  },
  {
    icon: Activity,
    title: "Rehabilitación",
    desc: "Kinesiología y fisioterapia adaptada a cada paciente.",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Atención Personalizada",
    desc: "Cada paciente recibe un plan de cuidado único y adaptado.",
  },
  {
    icon: CalendarCheck,
    title: "Reserva Online",
    desc: "Agenda las visitas de forma rápida sin complicaciones.",
  },
  {
    icon: Shield,
    title: "Equipo Especializado",
    desc: "Profesionales con formación en geriatría y cuidado del adulto mayor.",
  },
];

const testimonials = [
  {
    name: "Familia Rodríguez",
    text: "El cuidado que recibió mi madre fue excepcional. Profesionales con un trato muy humano y cercano.",
    rating: 5,
  },
  {
    name: "Patricia Muñoz",
    text: "La atención domiciliaria nos cambió la vida. Mi papá está mucho más tranquilo en su casa.",
    rating: 5,
  },
  {
    name: "Hermanos López",
    text: "Muy agradecidos por el cariño y profesionalismo con que cuidan a nuestro tío. Lo recomendamos 100%.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "¿Cómo puedo agendar una visita?",
    a: "Puedes agendar online seleccionando fecha y horario disponible. También puedes llamarnos directamente.",
  },
  {
    q: "¿Realizan visitas a domicilio?",
    a: "Sí, contamos con un programa de atención domiciliaria para pacientes con movilidad reducida.",
  },
  {
    q: "¿Qué incluye la evaluación geriátrica?",
    a: "Incluye evaluación médica, funcional, cognitiva y social para crear un plan de cuidado integral.",
  },
  {
    q: "¿Tienen cobertura en toda la región?",
    a: "Actualmente atendemos en Santiago y comunas aledañas. Consulta por cobertura en tu sector.",
  },
];

export default function VidagerPage() {
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
                  Agendar Visita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href={`/${config.slug}#servicios`}>Nuestros Servicios</Link>
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
              Cuidado especializado con calidez y respeto para nuestros adultos mayores.
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
              Agendar una visita es muy sencillo.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Elige Fecha y Hora", desc: "Selecciona el día y horario que prefieras." },
              { step: "2", title: "Ingresa tus Datos", desc: "Completa los datos del paciente y contacto." },
              { step: "3", title: "Recibe Confirmación", desc: "Te confirmaremos la visita por teléfono o correo." },
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
              <Link href={`/${config.slug}/agendar`}>Agendar Visita</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">¿Por Qué Elegir VidaGer?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Más de 8 años brindando cuidado de calidad a adultos mayores.
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Testimonios</h2>
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
            ¿Necesitas Ayuda?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Agenda una visita y descubre cómo podemos ayudarte.
          </p>
          <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
            <Link href={`/${config.slug}/agendar`}>
              Agendar Visita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
