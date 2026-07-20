"use client";

import { useShallow } from "zustand/react/shallow";

import { Check, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CloudflareIcon } from "@/components/ui/cloudflare-icon";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { LoginForm } from "../../_components/login-form";

export default function LoginV1() {
  const { login_video_theme, setPreference } = usePreferencesStore(
    useShallow((s) => ({
      login_video_theme: s.values.login_video_theme,
      setPreference: s.setPreference,
    })),
  );
  const tema = login_video_theme as "playa" | "cafe" | "nostalgia" | "otono" | "invierno" | "primavera" | "verano";
  const setTema = (v: typeof tema) => setPreference("login_video_theme", v);

  const videos: Record<string, string> = {
    playa: "/video-playa.mp4",
    cafe: "/video-cafe.mp4",
    nostalgia: "/video-nostalgia.mp4",
    otono: "/video-otono.mp4",
    invierno: "/video-invierno.mp4",
    primavera: "/video-primavera.mp4",
    verano: "/video-verano.mp4",
  };
  const videoSrc = videos[tema] ?? "/video-verano.mp4";

  const temaLabels: Record<string, string> = {
    playa: "Playa",
    cafe: "Café",
    nostalgia: "Nostalgia",
    otono: "Otoño",
    invierno: "Invierno",
    primavera: "Primavera",
    verano: "Verano",
  };

  const temaColors: Record<string, string> = {
    playa: "bg-sky-400",
    cafe: "bg-amber-700",
    nostalgia: "bg-purple-400",
    otono: "bg-orange-500",
    invierno: "bg-blue-200",
    primavera: "bg-pink-400",
    verano: "bg-yellow-400",
  };

  return (
    <div className="flex h-dvh">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full bg-black/30 text-white border-white/20 hover:bg-black/50 hover:text-white gap-1.5 px-3"
              >
                <Palette className="size-4" />
                {temaLabels[tema]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" align="start">
              <DropdownMenuLabel>Ambientes</DropdownMenuLabel>
              <DropdownMenuGroup>
                {(["playa", "cafe", "nostalgia"] as const).map((t) => (
                  <DropdownMenuItem key={t} onSelect={() => setTema(t)}>
                    <span className={`size-2 rounded-full ${temaColors[t]} mr-2 shrink-0`} />
                    {temaLabels[t]}
                    {tema === t && <Check className="size-3.5 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Estaciones</DropdownMenuLabel>
              <DropdownMenuGroup>
                {(["otono", "invierno", "primavera", "verano"] as const).map((t) => (
                  <DropdownMenuItem key={t} onSelect={() => setTema(t)}>
                    <span className={`size-2 rounded-full ${temaColors[t]} mr-2 shrink-0`} />
                    {temaLabels[t]}
                    {tema === t && <Check className="size-3.5 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
