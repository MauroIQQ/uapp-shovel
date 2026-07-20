"use client";

import Link from "next/link";
import { type LandingConfig, getLandingConfig } from "@/lib/landing-config";
import { MapPin, Phone, Mail, Clock, ArrowUp } from "lucide-react";

interface LandingFooterProps {
  slug: string
}

export function LandingFooter({ slug }: LandingFooterProps) {
  const config = getLandingConfig(slug)
  if (!config) return null

  const { theme, contact, name, social } = config

  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: theme.primary }}
              >
                {name.charAt(0)}
              </div>
              <span className="font-semibold text-white">{name}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Comprometidos con tu bienestar y salud.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: theme.primary }} />
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" style={{ color: theme.primary }} />
                <span>{contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" style={{ color: theme.primary }} />
                <span>{contact.email}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Horarios</h3>
            <li className="flex items-start gap-2 text-sm list-none">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: theme.primary }} />
              <span>{contact.schedule}</span>
            </li>
            {social && (
              <div className="flex gap-3 pt-2">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Acceso</h3>
            <div className="space-y-2 text-sm">
              <Link
                href={`/${config.slug}/agendar`}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Reservar Hora
              </Link>
              <Link
                href={`/${config.slug}#servicios`}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Servicios
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {name}. Todos los derechos reservados.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            Volver arriba <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
