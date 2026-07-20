"use client";

import * as React from "react";
import { Palette } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudflareIcon } from "@/components/ui/cloudflare-icon";
import { LoginForm } from "../../_components/login-form";

export default function LoginV1() {
  const [tema, setTema] = React.useState<"playa" | "cafe" | "nostalgia" | "otono" | "invierno" | "primavera" | "verano">("playa");

  const videos: Record<string, string> = {
    playa: "/video-verano.mp4",
    cafe: "/video-cafe.mp4",
    nostalgia: "/video-nostalgia.mp4",
    otono: "/video-otono.mp4",
    invierno: "/video-invierno.mp4",
    primavera: "/video-primavera.mp4",
    verano: "/video-verano.mp4",
  };
  const videoSrc = videos[tema] ?? "/video-verano.mp4";

  return (
    <div className="flex h-dvh">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div className="absolute top-4 right-4 z-20">
          <Select value={tema} onValueChange={(v) => setTema(v as typeof tema)}>
            <SelectTrigger className="w-36 rounded-full bg-black/30 text-white border-white/20 hover:bg-black/50">
              <Palette className="size-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="playa">Playa</SelectItem>
              <SelectItem value="cafe">Café</SelectItem>
              <SelectItem value="nostalgia">Nostalgia</SelectItem>
              <div className="h-px bg-border/50 my-1" role="separator" />
              <SelectItem value="otono">Otoño</SelectItem>
              <SelectItem value="invierno">Invierno</SelectItem>
              <SelectItem value="primavera">Primavera</SelectItem>
              <SelectItem value="verano">Verano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <video autoPlay muted loop playsInline key={tema} className="absolute inset-0 h-full w-full object-cover">
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <img
              src="/logo.png"
              alt="UAPP"
              className="mx-auto h-48 w-auto brightness-0 invert"
            />
            <p className="text-white text-sm font-light leading-relaxed">
              Unidad de Agendamiento y Planificación de Pacientes
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gradient-to-br from-background to-primary/20 p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-card p-8 shadow-sm space-y-8">
            <div className="space-y-4 text-center">
              <div className="font-medium text-2xl tracking-tight">Iniciar Sesión</div>
              <div className="mx-auto max-w-xl text-muted-foreground">
                Ingresa con tu RUT y contraseña para acceder al sistema.
              </div>
            </div>
            <LoginForm />
            <div className="flex justify-center pt-2 opacity-60">
              <CloudflareIcon size={84} color="hsl(var(--muted-foreground))" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
