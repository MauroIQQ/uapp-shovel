import type { ReactNode } from "react";
import type { Metadata } from "next";
import { LandingHeader } from "../_components/landing-header";
import { LandingFooter } from "../_components/landing-footer";
import { getLandingConfig } from "@/lib/landing-config";

const config = getLandingConfig("vidager")!;

export const metadata: Metadata = {
  title: config.name,
  description: config.description,
  icons: { icon: "/favicon.ico" },
};

export default function VidagerLayout({ children }: { children: ReactNode }) {
  const { theme } = config;

  return (
    <div
      className="min-h-screen bg-white"
      style={
        {
          "--brand-primary": theme.primary,
          "--brand-primary-light": theme.primaryLight,
          "--brand-accent": theme.accent,
        } as React.CSSProperties
      }
    >
      <LandingHeader slug="vidager" />
      <main className="pt-16">{children}</main>
      <LandingFooter slug="vidager" />
    </div>
  );
}
