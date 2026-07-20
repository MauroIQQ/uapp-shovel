# AGENTS.md

## UAPP - Unidad de Atencion y Programacion de Pacientes

Monorepo con npm workspaces + Turborepo.

### Estructura

```
uapp-shovel/
├── apps/
│   └── web/                          ← Next.js 16 App Router
│       ├── src/
│       │   ├── app/                  ← Rutas de Next
│       │   │   ├── (main)/dashboard/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── _components/sidebar/  ← solo Componentes en el menu
│       │   │   │   └── componentes/          ← catalogo UI (no tocar)
│       │   │   └── auth/             ← login/register
│       │   ├── modules/              ← DDD: cada carpeta = un modulo
│       │   │   └── _example/         ← template de referencia
│       │   │       ├── domain/       ← entidades, value objects, validacion
│       │   │       ├── application/  ← hooks useServerXxx, casos de uso
│       │   │       ├── infrastructure/← acceso a datos (Prisma, API)
│       │   │       └── presentation/ ← columnas, paginas, formularios
│       │   └── components/ui/        ← shadcn (no modificar)
│       ├── next.config.mjs
│       └── package.json
├── packages/
│   ├── database/                     ← Prisma schema + PrismaClient singleton
│   └── shared/                       ← tipos, schemas Zod, constantes
├── docs/                             ← planos del sistema UAPP
├── package.json                      ← workspace root
└── turbo.json
```

### Comandos

```bash
npm install          # instala todo el monorepo
npm run dev          # turbo dev → inicia apps/web
npm run build        # turbo build → construye todo
```

### Convenciones DDD

- Cada modulo en `src/modules/<nombre>/` con 4 capas
- `domain/`: entidades puras, sin dependencias de React/Next
- `application/`: hooks `useServerXxx` (patron ServerDataTable) + casos de uso
- `infrastructure/`: servicios que llaman a Prisma o API Routes
- `presentation/`: componentes React (paginas, columnas, formularios)
- Todos los CRUD usan `<ServerDataTable />` como componente base
- No modificar archivos en `src/components/ui/` (shadcn)
- No modificar archivos en `src/app/(main)/dashboard/componentes/` (catalogo UI)
