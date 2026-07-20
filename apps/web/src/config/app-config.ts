import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Componentes Shovel",
  version: packageJson.version,
  copyright: `© ${currentYear}, Componentes Shovel.`,
  meta: {
    title: "Componentes Shovel - Showroom de Componentes",
    description:
      "Catálogo visual de componentes UI basado en shadcn/ui, Next.js 16 y Tailwind CSS v4. Showroom interactivo para reutilizar componentes en proyectos.",
  },
};
