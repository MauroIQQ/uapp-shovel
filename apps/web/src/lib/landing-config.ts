export interface LandingConfig {
  slug: string
  rut_empresa: string
  name: string
  domain: string
  slogan: string
  description: string
  theme: {
    primary: string
    primaryLight: string
    accent: string
    gradientFrom: string
    gradientTo: string
  }
  heroImage?: string
  contact: {
    phone: string
    email: string
    address: string
    schedule: string
  }
  social?: {
    instagram?: string
    facebook?: string
  }
}

export const landingConfigs: Record<string, LandingConfig> = {
  renacimiento: {
    slug: "renacimiento",
    rut_empresa: "76140290-0",
    name: "Centro Médico Renacimiento",
    domain: "renacimiento.cl",
    slogan: "Tu salud, nuestra prioridad",
    description:
      "En Centro Médico Renacimiento ofrecemos atención médica de calidad con profesionales comprometidos en tu bienestar. Agenda tu hora de forma rápida y sencilla.",
    theme: {
      primary: "#0d9488",
      primaryLight: "#ccfbf1",
      accent: "#14b8a6",
      gradientFrom: "#0d9488",
      gradientTo: "#0f766e",
    },
    contact: {
      phone: "+56 2 2123 4567",
      email: "contacto@renacimiento.cl",
      address: "Av. Providencia 1234, Santiago",
      schedule: "Lun - Vie: 8:00 - 19:00 | Sáb: 9:00 - 14:00",
    },
    social: {
      instagram: "https://instagram.com/renacimiento",
      facebook: "https://facebook.com/renacimiento",
    },
  },
  vidager: {
    slug: "vidager",
    rut_empresa: "76649550-8",
    name: "Centro Geriátrico VidaGer",
    domain: "vidager.cl",
    slogan: "Cuidado y bienestar para nuestros mayores",
    description:
      "VidaGer es un centro especializado en atención geriátrica integral. Brindamos cuidado profesional con calidez y respeto a nuestros adultos mayores.",
    theme: {
      primary: "#2563eb",
      primaryLight: "#dbeafe",
      accent: "#3b82f6",
      gradientFrom: "#2563eb",
      gradientTo: "#1d4ed8",
    },
    contact: {
      phone: "+56 2 2987 6543",
      email: "contacto@vidager.cl",
      address: "Av. Las Condes 5678, Santiago",
      schedule: "Lun - Vie: 8:30 - 18:00 | Sáb: 9:00 - 13:00",
    },
    social: {
      instagram: "https://instagram.com/vidager",
      facebook: "https://facebook.com/vidager",
    },
  },
}

export function getLandingConfig(slug: string): LandingConfig | undefined {
  return landingConfigs[slug]
}

const domainToSlug: Record<string, string> = {}
for (const config of Object.values(landingConfigs)) {
  domainToSlug[config.domain] = config.slug
  domainToSlug[`www.${config.domain}`] = config.slug
}

export function getSlugByDomain(host: string): string | undefined {
  const cleanHost = host.replace(/:\d+$/, "").toLowerCase()
  return domainToSlug[cleanHost]
}
