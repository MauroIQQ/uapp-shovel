# Studio Admin — UAPP

> Monorepo dashboard médico — Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (radix-nova)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js, npm workspaces, Turborepo |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API Routes (serverless), Prisma 7 |
| Database | PostgreSQL 18.4 (Neon) |
| File storage | Cloudflare R2 |
| Auth | JWT con jose, login RUT + password, multitenant por rut_empresa |

## Estructura del monorepo

```
uapp-shovel/
├── apps/web/          # Aplicación Next.js
│   └── src/
│       ├── app/       # App Router (rutas + API)
│       ├── modules/   # Módulos DDD
│       ├── components/# UI components compartidos
│       └── navigation/# Sidebar, layout
├── packages/
│   ├── database/      # Prisma schema + client (@uapp/database)
│   └── shared/        # Tipos compartidos, validarRut (@uapp/shared)
```

## Convenciones de código

- TypeScript strict mode — prohibido `any`
- Biome: double quotes, semicolons, 2-space indent, 120 col width
- DDD por módulo: `domain/` → `application/` → `infrastructure/` → `presentation/`
- Co-location: feature code dentro de la ruta que lo usa
- Server Component por defecto, Client Component solo para interactividad
- `@/` alias para imports

## Rutas (49 total)

### Dashboard
| Ruta | Descripción |
|------|------------|
| `/dashboard` | Home del dashboard |
| `/dashboard/agenda` | Calendario mensual + lista de citas |
| `/dashboard/fichas` | Pacientes agendados para hoy |
| `/dashboard/fichas/[rut]` | Ficha clínica completa (4 tabs) |
| `/dashboard/pacientes` | CRUD pacientes |
| `/dashboard/profesional/kardex` | Kardex de artículos |
| `/dashboard/profesional/medicamentos` | Catálogo de medicamentos |
| `/dashboard/administracion/previsiones` | Previsiones de salud |
| `/dashboard/administracion/horarios` | Horarios de atención |
| `/dashboard/administracion/tipos-atencion` | Tipos de consulta |
| `/dashboard/administracion/dias-bloqueados` | Días bloqueados |
| `/dashboard/configuracion/usuarios` | Usuarios del sistema |
| `/dashboard/configuracion/empresas` | Empresas (multitenant) |
| `/dashboard/configuracion/perfiles` | Perfiles y permisos |
| `/dashboard/configuracion/categorias-documentos` | Categorías de documentos clínicos |

### API
| Ruta | Métodos |
|------|---------|
| `/api/auth/login` | POST (login con JWT) |
| `/api/auth/logout` | POST |
| `/api/agenda` | GET, POST, PATCH, DELETE |
| `/api/bitacoras` | GET, POST |
| `/api/bitacoras/[id]` | GET, PATCH |
| `/api/bitacoras/[id]/diagnosticos` | GET, POST |
| `/api/bitacoras/diagnosticos/[id]` | PATCH, DELETE |
| `/api/bitacoras/[id]/recetas` | GET, POST |
| `/api/bitacoras/recetas/[id]` | DELETE |
| `/api/bitacoras/[id]/ordenes` | GET, POST |
| `/api/bitacoras/ordenes/[id]` | DELETE |
| `/api/bitacoras/[id]/procedimientos` | GET, POST |
| `/api/bitacoras/procedimientos/[id]` | DELETE |
| `/api/bitacoras/[id]/documentos` | GET |
| `/api/bitacoras/[id]/adjuntos` | GET, POST |
| `/api/bitacoras/adjuntos/[id]` | DELETE |
| `/api/fichas` | GET (by rut), POST |
| `/api/fichas/[id]` | PATCH |
| `/api/fichas/[id]/ante-personales` | GET, POST |
| `/api/fichas/ante-personales/[id]` | DELETE |
| `/api/fichas/[id]/quirurgicos` | GET, POST |
| `/api/fichas/quirurgicos/[id]` | PATCH, DELETE |
| `/api/fichas/[id]/familiares` | GET, POST |
| `/api/fichas/familiares/[id]` | PATCH, DELETE |
| `/api/fichas/[id]/alergias` | GET, POST |
| `/api/fichas/alergias/[id]` | PATCH, DELETE |
| `/api/fichas/[id]/medicacion-cronica` | GET, POST |
| `/api/fichas/medicacion-cronica/[id]` | PATCH, DELETE |
| `/api/fichas/[id]/problemas-activos` | GET, POST |
| `/api/fichas/problemas-activos/[id]` | PATCH, DELETE |
| `/api/fichas/[id]/habitos` | GET, PATCH |
| `/api/fichas/[id]/archivos` | GET, POST (R2) |
| `/api/fichas/archivos/[id]` | DELETE |
| `/api/configuracion/categorias-documentos` | GET, POST |
| `/api/configuracion/categorias-documentos/[id]` | PATCH, DELETE |
| `/api/configuracion/categorias-documentos/[id]/subcategorias` | GET, POST |
| `/api/configuracion/subcategorias/[id]` | PATCH, DELETE |
| `/api/categorias-documentos` | GET (público, para dropdowns) |
| `/api/usuarios/verificar-clave` | POST (verificar contraseña) |

## Módulos DDD implementados

| Módulo | Entidad principal | Estado |
|--------|-------------------|--------|
| Agenda | Cita (uapp_horas) | ✅ |
| Kardex | Artículo (uapp_kardex) | ✅ |
| Días Bloqueados | DiaBloqueado (uapp_dias_bloqueados) | ✅ |
| Previsiones | Prevision (uapp_previsiones) | ✅ |
| Horarios | Horario (uapp_horarios) | ✅ |
| Tipos de Atención | TipoHora (uapp_tipos_horas) | ✅ |
| Fichas Clínicas | FichaClinica + Bitacora + 12 sub-entidades | ✅ |
| Pacientes | Paciente (uapp_pacientes) | ✅ |
| Documentos Categorías | Categorías + Subcategorías de documentos | ✅ |

## Sidebar

| Grupo | ID | Items |
|-------|----|-------|
| Asistencia | 1 | Pacientes, Agenda |
| Configuración | 2 (colapsable, solo Root) | Usuarios, Empresas, Perfiles, Categorías Documentos |
| Profesional | 3 | Medicamentos, Kardex, Fichas Clínicas |
| Administración | 4 | Previsiones, Horarios, Tipos de Atención, Días Bloqueados |
| Componentes | 5 | Biblioteca de UI (~12 sub-páginas) |

## Base de datos

- PostgreSQL vía Prisma 7 con `@prisma/adapter-pg`
- 20+ tablas en esquema `public`, prefijo `uapp_`
- Multitenant por `rut_empresa`: cada tabla de negocio tiene el campo y se filtra por JWT del usuario logueado
- `estado` es boolean en DB → mapeado a `"activo"`/`"inactivo"` en API
- Timestamps: `created` con `@default(now())`, `updated` debe setearse manualmente

## Reglas clave para la IA

1. **NO modificar** `src/components/ui/` ni `src/components/calendar/` — aplicar estilos donde se usan
2. **Seguir patrón DDD** existente — mirar Previsiones (CRUD simple) o Agenda (complejo) como referencia
3. **JWT + multitenant**: `verifyAuth(req)` en cada API route para obtener `rut_empresa`. Root (perfil=0) accede a Configuración; otros perfiles filtran por `uapp_permisos`
4. **`updated` debe setearse** como `new Date()` explícitamente en cada PATCH
5. **POST /api/fichas** usa try-catch para race conditions
6. **Archivos** se suben a Cloudflare R2 con SDK S3 + presigned URLs, máximo 25MB
7. **DropdownMenu** debe tener **primer item** como opción principal (ej: "Ficha Clínica")
8. **Formularios** usan botón "Guardar" explícito — prohibido auto-save en cada tecla

## Comandos

```bash
npm run dev        # Turbo dev
npm run build      # Turbo build
npm run lint       # Turbo lint
npm run format     # Turbo format
```

Prisma (desde `packages/database/`):
```bash
npm run db:generate   # prisma generate
npm run db:push       # prisma db push
npm run db:migrate    # prisma migrate dev
```

## Archivos de configuración

- `AGENTS.md` — Instrucciones para la IA en la raíz del proyecto
- `components.json` — Configuración de shadcn/ui
- `biome.json` — Reglas de linting y formato
- `turbo.json` — Pipeline de Turborepo
