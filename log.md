# Development Log — Studio Admin (UAPP)

> Bitácora cronológica de desarrollo del sistema.

---

## 2026-07-19 — Sesión 1: Agenda + CRUD Admin

### Agenda
- Calendario mensual custom con Radix UI (reemplazó FullCalendar por incompatibilidad de estilos)
- CitaFormSheet con búsqueda de paciente por RUT
- Creación inline de paciente si no existe en el sistema
- Switch Extranjero desactiva validación chilena de RUT
- Validación en orden: sección paciente → sección cita
- Filtros: Estado (Select: Todos/Confirmados/Atendidos) + Turno (Tabs AM/PM con auto-selección por hora del sistema)
- Los filtros de Estado y Turno están posicionados sobre la lista de citas (columna derecha)
- DropdownMenu con editar/eliminar + acceso a Ficha Clínica
- Checkboxes display-only para Confirmado y Atendido
- Icono Earth con tooltip para citas agendadas desde web
- Botón + Switch para Confirmado (nueva cita) y Confirmado + Atendido (editar cita)
- Formato de fecha corto DD/MM/YY en el date picker
- Nombre del paciente visible en modo edición

### CRUD Admin
- Previsiones, Horarios, Tipos de Atención, Días Bloqueados
- ServerDataTable con filtro por nombre y búsqueda
- Soft delete con mapeo estado boolean → "activo"/"inactivo"
- Días Bloqueados con CalendarX icon y formato de fecha PPP locale es-CL
- Días Bloqueados usa hard delete por compound PK (fecha, rut_empresa)

## 2026-07-19 — Sesión 2: Kardex

- CRUD completo con ServerDataTable
- Hard delete por id_articulo (sin columna estado)
- Validación stock_actual >= 0

## 2026-07-19 — Sesión 3: Ficha Clínica (sesión larga ~45 archivos)

### Modelo de datos (Prisma)
- Eliminado `uapp_antecedentes` (modelo plano con booleanos)
- Creadas 12 tablas 1:N con relaciones en cascada:
  - `uapp_ante_personales` — enfermedades crónicas
  - `uapp_ante_quirurgicos` — cirugías previas
  - `uapp_ante_familiares` — antecedentes familiares
  - `uapp_alergias` — alergias con severidad
  - `uapp_medicacion_cronica` — medicamentos de uso continuo
  - `uapp_problemas_activos` — diagnósticos activos con CIE-10
  - `uapp_habitos` — 1:1 con ficha
  - `uapp_diagnosticos` — por bitácora
  - `uapp_recetas_detalle` — detalle de recetas
  - `uapp_ordenes_medicas` — laboratorio, imágenes, etc.
  - `uapp_procedimientos` — procedimientos clínicos
  - `uapp_documentos_emitidos` — certificados, informes
  - `uapp_adjuntos` — archivos por atención
  - `uapp_archivos_generales` — archivos del paciente
- Extendido `uapp_fichas_clinicas` con grupo sanguíneo, factor RH, donante, observaciones
- Extendido `uapp_bitacoras` con signos vitales (PA, pulso, SatO₂, temp, glicemia, etc.) y campos clínicos
- Extendido `uapp_recetas` con validez, estado y detalle 1:N

### API Routes (30 archivos)
- `/api/fichas` — CRUD ficha (GET by rut, POST con upsert, PATCH)
- `/api/fichas/[id]/*` — 9 sub-entidades con GET/POST/PATCH/DELETE
- `/api/bitacoras` — GET por ficha, POST con nested create
- `/api/bitacoras/[id]/*` — 6 sub-entidades con GET/POST/DELETE
- File upload a Cloudflare R2 con fetch PUT (solo texto plano, sin SDK)

### UI — Página principal de fichas
- `/dashboard/fichas` — pacientes agendados para hoy
- Filtro Todos/Confirmados con Tabs
- Cada fila: hora, nombre, RUT, tipo consulta, badge Confirmado, origen web
- Click navega a `/dashboard/fichas/[rut]`

### UI — Ficha clínica (4 tabs)
1. **Ficha (Datos Generales)** — formulario con botón "Guardar cambios"
2. **Antecedentes** — 7 secciones con listas 1:N y diálogos de agregar
3. **Atenciones** — timeline de bitácoras + botón "Nueva Atención"
4. **Archivos** — upload a R2 + listado con eliminar

### UI — Bitácora
- Sheet con react-hook-form + Zod
- Secciones: motivo consulta, enfermedad actual, signos vitales (grid), examen físico, anamnesis, diagnósticos (useFieldArray), plan, indicaciones, recetas (nested useFieldArray), próximo control (date picker)

### Bugs corregidos
- Race condition en POST /api/fichas: dos requests simultáneos violaban unique constraint → fix con try-catch + re-fetch
- Keys duplicadas en lista-pacientes-ficha: pacientes con múltiples citas el mismo día → fix con `${rut}-${hora}`
- Auto-save en cada tecla en DatosGeneralesTab: onChange disparaba PATCH por carácter → reemplazado por formulario con botón "Guardar cambios"

### Sidebar
- "Fichas Clínicas" movido de Asistencia (id:1) a Profesional (id:3)
- SISTEMA_MODULOS actualizado con grupo "Profesional"
- DropdownMenuItem "Ficha Clínica" agregado en agenda (primer item del menú)

## Próximos pasos
- Generación de PDF para recetas médicas
- Dashboard principal con métricas
- Migrar resto de servicios a apiFetch (pendientes de revision)

---

## 2026-07-20 — Sesión 4: Auth + Multitenant + Archivos + Categorías

### Sistema de Autenticación
- Login funcional con RUT + password usando bcrypt
- JWT con `jose` (HS256, expira 12h) almacenado en localStorage
- `AuthContext` + `AuthProvider` en root layout
- `ProtectedRoute` redirige a login si no hay sesión
- Login simplificado: solo RUT + password, sin Google/Facebook
- Sidebar muestra usuario real desde auth context
- Botón "Cerrar sesión" funcional

### Multitenant
- `verifyAuth(req)` en 13+ API routes para obtener `rut_empresa` dinámico desde JWT
- Sidebar filtra menú por perfil usando `uapp_permisos`:
  - Root (perfil=0): ve todo + menú Configuración
  - Asistente/Administrador/Profesional (1-3): ven solo según permisos
- API routes de Configuración (usuarios, empresas, perfiles, categorías documentos) requieren perfil Root
- Usuario CRUD: campo empresa seleccionable (Root puede asignar empresa)
- Servicios migrados de `fetch()` a `apiFetch()` con JWT automático

### Archivos (Cloudflare R2)
- Upload con SDK `@aws-sdk/client-s3` + presigned URLs
- Barra de progreso con XHR + monitor de subida en card derecho
- Múltiples archivos simultáneos con cola de subida
- Validación: solo PDF, Office, imágenes | máx 25MB
- Error claro cuando archivo excede límite
- Eliminar con AlertDialog (mismo día → confirm, >24h → verificar clave)

### Categorías de Documentos
- Módulo DDD completo: dominio, infraestructura, aplicación, presentación
- CRUD: tabla expandible con categorías + subcategorías anidadas
- Sheet para crear/editar categorías, Dialog para subcategorías
- Seed: 7 categorías y 44 subcategorías del catálogo clínico
- Sidebar: nuevo item "Categorías Documentos" bajo Configuración
- Archivos: dropdowns obligatorios de categoría + subcategoría al subir

### UI y correcciones
- Spinner animado en todos los estados de carga
- Sheet de atención con ancho configurable (767px → 959px → 1229px → 1598px → 767px)
- Selects de categoría/subcategoría con tamaño fijo (`w-full` en trigger y content)
- Bitácora: modo edición (carga datos existentes), persistencia de diagnósticos y recetas
- Vista expandida de atenciones: muestra más campos (FR, glicemia, peso, IMC, etc.)
- Ficha clínica: nombre del paciente al lado del RUT con separador
- Fecha `proximo_control` convertida a ISO-8601 completo para Prisma
- Error de hooks en RecetaItem corregido (extraído a componente propio)
