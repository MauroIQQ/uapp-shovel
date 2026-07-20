"use client";

import Link from "next/link";
import { type LandingConfig, getLandingConfig } from "@/lib/landing-config";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface LandingHeaderProps {
  slug: string
}

export function LandingHeader({ slug }: LandingHeaderProps) {
  const config = getLandingConfig(slug)
  if (!config) return null

  return <HeaderContent config={config} />;
}

function HeaderContent({ config }: { config: LandingConfig }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = config;

  const navLinks = [
    { label: "Inicio", href: `/${config.slug}` },
    { label: "Servicios", href: `/${config.slug}#servicios` },
    { label: "Beneficios", href: `/${config.slug}#beneficios` },
    { label: "Contacto", href: `/${config.slug}#contacto` },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${config.slug}`} className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: theme.primary }}
            >
              {config.name.charAt(0)}
            </div>
            <span className="font-semibold text-gray-900">{config.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild style={{ backgroundColor: theme.primary }} className="hover:opacity-90 text-white">
              <Link href={`/${config.slug}/agendar`}>Reservar Hora</Link>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              asChild
              className="w-full mt-3"
              style={{ backgroundColor: theme.primary }}
              onClick={() => setMobileOpen(false)}
            >
              <Link href={`/${config.slug}/agendar`}>Reservar Hora</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
