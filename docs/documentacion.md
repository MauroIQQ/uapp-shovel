# Documentación de APIs — UAPP Shovel

> **Sistema:** Unidad de Atención y Programación de Pacientes (UAPP)
> **Stack:** Next.js 16 App Router, Prisma (PostgreSQL), JWT, Cloudflare R2
> **Arquitectura:** Monorepo (npm workspaces + Turborepo) con módulos DDD

---

## Índice

1. [Autenticación y Autorización](#1-autenticación-y-autorización)
2. [API Routes](#2-api-routes)
   - 2.1 [Agenda (Citas)](#21-agenda-citas)
   - 2.2 [Pacientes](#22-pacientes)
   - 2.3 [Búsqueda de Pacientes](#23-búsqueda-de-pacientes)
   - 2.4 [Fichas Clínicas](#24-fichas-clínicas)
   - 2.5 [Sub-recursos de Fichas](#25-sub-recursos-de-fichas-clínicas)
   - 2.6 [Bitácoras (Notas Clínicas)](#26-bitácoras-notas-clínicas)
   - 2.7 [Sub-recursos de Bitácoras](#27-sub-recursos-de-bitácoras)
   - 2.8 [Usuarios](#28-usuarios)
   - 2.9 [Empresas](#29-empresas)
   - 2.10 [Maestros / Catálogos](#210-maestros--catálogos)
   - 2.11 [Chat](#211-chat)
   - 2.12 [Configuración](#212-configuración)
3. [Server Actions](#3-server-actions)
4. [Modelos de Base de Datos](#4-modelos-de-base-de-datos)
5. [Tipos Compartidos (`@uapp/shared`)](#5-tipos-compartidos-uappshared)
6. [Librerías de Soporte](#6-librerías-de-soporte)
7. [Estructura de Módulos](#7-estructura-de-módulos)

---

## 1. Autenticación y Autorización

### Esquema de Autenticación

El sistema usa **JWT (HS256)** con expiración de 12 horas. El token se entrega en:

- **Cookie httpOnly** (`token`) — para SSR y Server Components
- **Response body** — para el cliente SPA
- **Header `Authorization: Bearer <token>`** — para todas las llamadas API desde el cliente

### Payload del JWT

```typescript
interface JwtPayload {
  rut: string;
  rut_empresa: string;
  perfil: number; // 0=Root, 1=Asistente, 2=Administrador, 3=Profesional
}
```

### Perfiles de Usuario

| Valor | Nombre | Descripción |
|-------|--------|-------------|
| 0 | Root | Acceso total al sistema, multi-empresa |
| 1 | Asistente | Atención al paciente, agenda |
| 2 | Administrador | Gestión de catálogos y configuración |
| 3 | Profesional | Atención clínica, fichas y recetas |

### Middleware de Protección

- **`verifyAuth(req)`** — Extrae y valida el token del header `Authorization`. Se usa en todas las API routes protegidas. Retorna `JwtPayload`.
- **`requireRoot(auth)` — Guard para endpoints exclusivos de Root. Retorna `{ ok, auth }`.
- **`getServerAuth()`** — Lee el token desde la cookie `token` en el servidor. Usado en SSE streams y Server Components.

### Endpoints de Autenticación

#### `POST /api/auth/login`
- **Archivo:** `apps/web/src/app/api/auth/login/route.ts`
- **Auth:** Público
- **Body:** `{ rut: string, password: string }`
- **Respuesta:** `{ token: string, user: { rut, nombre, paterno, materno, correo, perfil, rut_empresa } }`
- **Función:** Autentica al usuario por RUT y password (bcrypt). Retorna JWT en cookie + body. La sesión dura 12 horas.
- **Base de datos:** `uapp_usuarios`

#### `POST /api/auth/logout`
- **Archivo:** `apps/web/src/app/api/auth/logout/route.ts`
- **Auth:** Público
- **Respuesta:** `{ success: true }`
- **Función:** Limpia la cookie `token` (maxAge = 0).

---

## 2. API Routes

Todas las rutas viven en `apps/web/src/app/api/`. Cada archivo `route.ts` exporta funciones HTTP (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`).

Las rutas protegidas usan `verifyAuth()` y opcionalmente `requireRoot()`.

---

### 2.1 Agenda (Citas)

Gestiona la programación de citas médicas con calendario mensual y vista diaria.

#### `GET /api/agenda`
- **Auth:** Bearer token
- **Query:**
  - `fecha` (YYYY-MM-DD) — retorna todas las citas del día
  - `mes` (YYYY-MM) — retorna resumen mensual (conteo por día)
- **Respuesta (mes):** `{ data: [{ dia, count, bloqueado, motivo, horasBloqueadas }] }`
- **Respuesta (fecha):** `{ data: [{ id, rut_paciente, paciente_nombre, fecha_hora, id_tipo_consulta, tipo_consulta, prevision, prevision_nombre, estado, origen, telefono, celular, correo, observaciones }] }`
- **Función:** Obtener citas del día o resumen mensual para el calendario. Los días bloqueados se marcan automáticamente.
- **Base de datos:** `uapp_horas`, `uapp_pacientes`, `uapp_previsiones`, `uapp_tipos_horas`, `uapp_dias_bloqueados`, `uapp_horas_bloqueadas`

#### `POST /api/agenda`
- **Auth:** Bearer token
- **Body:** `{ rut_paciente, fecha_hora, id_tipo_consulta, prevision, origen?, telefono?, celular?, correo?, observaciones? }`
- **Respuesta:** `201 { data: { id, ... } }`
- **Función:** Crea una nueva cita en la agenda.

#### `PATCH /api/agenda`
- **Auth:** Bearer token
- **Body:** `{ id, ...campos }` (incluye opcional `estado`: `"activo" | "inactivo"`)
- **Función:** Actualiza una cita existente (reprogramar, cambiar tipo, etc.).

#### `DELETE /api/agenda?id=N`
- **Auth:** Bearer token
- **Query:** `id` (number)
- **Respuesta:** `{ success: true }`
- **Función:** Elimina una cita por su ID.

---

### 2.2 Pacientes

Registro maestro de pacientes con identificación por RUT y empresa.

#### `GET /api/pacientes`
- **Auth:** Bearer token
- **Query:** `rut` (opcional) — si se provee, retorna un paciente; si no, todos los pacientes de la empresa
- **Respuesta:** `{ data: [{ rut, rut_empresa, nombre_completo, sexo, fecha_nacimiento, telefono, celular, correo, direccion, id_prevision, prevision_nombre, estado }] }`
- **Función:** Listar pacientes o buscar por RUT. `estado` se mapea a `"activo" / "inactivo"`.
- **Base de datos:** `uapp_pacientes`

#### `POST /api/pacientes`
- **Auth:** Bearer token
- **Body:** `{ rut, nombre_completo, sexo, fecha_nacimiento, telefono?, celular?, correo?, direccion?, id_prevision? }`
- **Respuesta:** `201 { data: { ... } }`
- **Función:** Crea un nuevo paciente. La clave primaria compuesta es `(rut, rut_empresa)`.

#### `PATCH /api/pacientes`
- **Auth:** Bearer token
- **Body:** `{ rut, ...campos }`
- **Función:** Actualiza datos del paciente por clave compuesta.

#### `DELETE /api/pacientes?rut=X`
- **Auth:** Bearer token
- **Query:** `rut` (string)
- **Respuesta:** `{ success: true }`
- **Función:** Elimina un paciente (borrado físico).

---

### 2.3 Búsqueda de Pacientes

Búsqueda rápida con autocompletado para usar en formularios de agenda y fichas.

#### `GET /api/busqueda-pacientes`
- **Archivo:** `apps/web/src/app/api/busqueda-pacientes/route.ts`
- **Auth:** Bearer token
- **Query:** `q` (string, mínimo 2 caracteres)
- **Respuesta:** `{ data: [{ rut, nombre_completo, sexo, fecha_nacimiento, edad, telefono, celular, correo, prevision, ultima_cita, confirmada, atendido }] }`
- **Función:** Busca pacientes por RUT o nombre (case-insensitive). Solo retorna pacientes con al menos una cita. Limitado a 50 resultados. Incluye datos de la última cita y estado.
- **Base de datos:** `uapp_pacientes`, `uapp_previsiones`, `uapp_horas`

---

### 2.4 Fichas Clínicas

Expediente clínico del paciente. Una ficha por paciente por empresa.

#### `GET /api/fichas`
- **Archivo:** `apps/web/src/app/api/fichas/route.ts`
- **Auth:** Bearer token
- **Query:** `rut` (RUT del paciente)
- **Respuesta:** `{ data: { id, rut_paciente, rut_empresa, ... } }`
- **Función:** Obtiene la ficha clínica de un paciente.
- **Base de datos:** `uapp_fichas_clinicas`

#### `POST /api/fichas`
- **Auth:** Bearer token
- **Body:** `{ rut_paciente: string }`
- **Respuesta:** `201 { data: { ... } }` (200 si ya existe)
- **Función:** Crea una ficha clínica para un paciente. Es idempotente — retorna la existente si ya fue creada.

#### `PATCH /api/fichas/[id]`
- **Archivo:** `apps/web/src/app/api/fichas/[id]/route.ts`
- **Auth:** Cookie token (depende del middleware)
- **Params:** `id` (number)
- **Body:** Campos actualizables de `uapp_fichas_clinicas`
- **Función:** Actualiza una ficha clínica por su ID.

---

### 2.5 Sub-recursos de Fichas Clínicas

Rutas anidadas bajo `/api/fichas/[id]/...` y `/api/fichas/{resource}/[id]` para gestionar datos clínicos estructurados.

#### Alergias

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/alergias` | `apps/web/src/app/api/fichas/[id]/alergias/route.ts` | Lista alergias de la ficha |
| POST | `/api/fichas/[id]/alergias` | mismo archivo | Crea una alergia |
| PATCH | `/api/fichas/alergias/[id]` | `apps/web/src/app/api/fichas/alergias/[id]/route.ts` | Actualiza una alergia |
| DELETE | `/api/fichas/alergias/[id]` | mismo archivo | Elimina una alergia |

**Base de datos:** `uapp_alergias`

#### Antecedentes Personales

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/ante-personales` | `apps/web/src/app/api/fichas/[id]/ante-personales/route.ts` | Lista antecedentes personales |
| POST | `/api/fichas/[id]/ante-personales` | mismo archivo | Crea antecedente personal |
| DELETE | `/api/fichas/ante-personales/[id]` | `apps/web/src/app/api/fichas/ante-personales/[id]/route.ts` | Elimina antecedente |

**Base de datos:** `uapp_ante_personales`. Unicidad: `(id_ficha, tipo)`.

#### Antecedentes Familiares

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/familiares` | `apps/web/src/app/api/fichas/[id]/familiares/route.ts` | Lista antecedentes familiares |
| POST | `/api/fichas/[id]/familiares` | mismo archivo | Crea antecedente familiar |
| PATCH | `/api/fichas/familiares/[id]` | `apps/web/src/app/api/fichas/familiares/[id]/route.ts` | Actualiza antecedente |
| DELETE | `/api/fichas/familiares/[id]` | mismo archivo | Elimina antecedente |

**Base de datos:** `uapp_ante_familiares`

#### Medicación Crónica

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/medicacion-cronica` | `apps/web/src/app/api/fichas/[id]/medicacion-cronica/route.ts` | Lista medicación crónica |
| POST | `/api/fichas/[id]/medicacion-cronica` | mismo archivo | Crea medicación crónica |
| PATCH | `/api/fichas/medicacion-cronica/[id]` | `apps/web/src/app/api/fichas/medicacion-cronica/[id]/route.ts` | Actualiza medicación |
| DELETE | `/api/fichas/medicacion-cronica/[id]` | mismo archivo | Elimina medicación |

**Base de datos:** `uapp_medicacion_cronica`

#### Problemas Activos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/problemas-activos` | `apps/web/src/app/api/fichas/[id]/problemas-activos/route.ts` | Lista problemas activos |
| POST | `/api/fichas/[id]/problemas-activos` | mismo archivo | Crea problema activo |
| PATCH | `/api/fichas/problemas-activos/[id]` | `apps/web/src/app/api/fichas/problemas-activos/[id]/route.ts` | Actualiza problema |
| DELETE | `/api/fichas/problemas-activos/[id]` | mismo archivo | Elimina problema |

**Base de datos:** `uapp_problemas_activos`. Incluye código CIE-10 opcional.

#### Antecedentes Quirúrgicos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/quirurgicos` | `apps/web/src/app/api/fichas/[id]/quirurgicos/route.ts` | Lista antecedentes quirúrgicos |
| POST | `/api/fichas/[id]/quirurgicos` | mismo archivo | Crea antecedente quirúrgico |
| PATCH | `/api/fichas/quirurgicos/[id]` | `apps/web/src/app/api/fichas/quirurgicos/[id]/route.ts` | Actualiza antecedente |
| DELETE | `/api/fichas/quirurgicos/[id]` | mismo archivo | Elimina antecedente |

**Base de datos:** `uapp_ante_quirurgicos`

#### Hábitos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/habitos` | `apps/web/src/app/api/fichas/[id]/habitos/route.ts` | Obtiene datos de hábitos |
| PATCH | `/api/fichas/[id]/habitos` | mismo archivo | Crea o actualiza hábitos (upsert) |

**Base de datos:** `uapp_habitos`. Relación uno-a-uno con la ficha clínica. Incluye: tabaquismo, alcohol, actividad física, sueño, etc.

#### Archivos Generales

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/fichas/[id]/archivos` | `apps/web/src/app/api/fichas/[id]/archivos/route.ts` | Lista archivos con URLs firmadas de R2 |
| POST | `/api/fichas/[id]/archivos` | mismo archivo | Sube archivo a R2 (FormData, máx 25 MB) |
| DELETE | `/api/fichas/archivos/[id]` | `apps/web/src/app/api/fichas/archivos/[id]/route.ts` | Elimina archivo de R2 y BD |

- **Formatos soportados:** PDF, Office (doc/docx/xls/xlsx), imágenes (jpg/png/gif)
- **Base de datos:** `uapp_archivos_generales`, `uapp_document_subcategories`, `uapp_document_categories`
- **Externo:** Cloudflare R2

---

### 2.6 Bitácoras (Notas Clínicas)

Registro de atenciones médicas (SOAP) vinculado a una ficha clínica.

#### `GET /api/bitacoras?ficha_id=N`
- **Archivo:** `apps/web/src/app/api/bitacoras/route.ts`
- **Auth:** Bearer token
- **Query:** `ficha_id` (number)
- **Respuesta:** `{ data: [{ id, id_ficha_clinica, motivo_consulta, ... }] }`
- **Función:** Lista todas las bitácoras de una ficha, ordenadas por fecha de creación descendente.
- **Base de datos:** `uapp_bitacoras`

#### `POST /api/bitacoras`
- **Archivo:** `apps/web/src/app/api/bitacoras/route.ts`
- **Auth:** Bearer token
- **Body:** `{ id_ficha_clinica, motivo_consulta, enfermedad_actual, apa, examinacion_fisica, impresion_diagnostica, plan, indicaciones, observaciones? }`
- **Función:** Crea una nueva nota clínica (bitácora).

#### `GET /api/bitacoras/[id]`
- **Archivo:** `apps/web/src/app/api/bitacoras/[id]/route.ts`
- **Auth:** Bearer token
- **Función:** Obtiene una bitácora específica con todos sus campos.

#### `PATCH /api/bitacoras/[id]`
- **Archivo:** `apps/web/src/app/api/bitacoras/[id]/route.ts`
- **Auth:** Bearer token
- **Función:** Actualiza una bitácora existente.

---

### 2.7 Sub-recursos de Bitácoras

Rutas anidadas bajo `/api/bitacoras/[id]/...` para diagnósticos, órdenes, procedimientos, recetas, documentos y adjuntos.

#### Diagnósticos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/bitacoras/[id]/diagnosticos` | `apps/web/src/app/api/bitacoras/[id]/diagnosticos/route.ts` | Lista diagnósticos de la bitácora |
| POST | `/api/bitacoras/[id]/diagnosticos` | mismo archivo | Crea un diagnóstico |
| PATCH | `/api/bitacoras/diagnosticos/[id]` | `apps/web/src/app/api/bitacoras/diagnosticos/[id]/route.ts` | Actualiza diagnóstico |
| DELETE | `/api/bitacoras/diagnosticos/[id]` | mismo archivo | Elimina diagnóstico |

**Base de datos:** `uapp_diagnosticos`

#### Órdenes Médicas

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/bitacoras/[id]/ordenes` | `apps/web/src/app/api/bitacoras/[id]/ordenes/route.ts` | Lista órdenes médicas |
| POST | `/api/bitacoras/[id]/ordenes` | mismo archivo | Crea orden médica |
| DELETE | `/api/bitacoras/ordenes/[id]` | `apps/web/src/app/api/bitacoras/ordenes/[id]/route.ts` | Elimina orden médica |

**Base de datos:** `uapp_ordenes_medicas`
**Tipos de orden:** `laboratorio`, `imagenologia`, `procedimiento`, `interconsulta`, `hospitalizacion`

#### Procedimientos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/bitacoras/[id]/procedimientos` | `apps/web/src/app/api/bitacoras/[id]/procedimientos/route.ts` | Lista procedimientos |
| POST | `/api/bitacoras/[id]/procedimientos` | mismo archivo | Crea procedimiento |
| DELETE | `/api/bitacoras/procedimientos/[id]` | `apps/web/src/app/api/bitacoras/procedimientos/[id]/route.ts` | Elimina procedimiento |

**Base de datos:** `uapp_procedimientos`

#### Recetas

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/bitacoras/[id]/recetas` | `apps/web/src/app/api/bitacoras/[id]/recetas/route.ts` | Lista recetas con detalle |
| POST | `/api/bitacoras/[id]/recetas` | mismo archivo | Crea receta con detalle anidado |
| DELETE | `/api/bitacoras/recetas/[id]` | `apps/web/src/app/api/bitacoras/recetas/[id]/route.ts` | Elimina receta |

**Base de datos:** `uapp_recetas`, `uapp_recetas_detalle`
**Nota:** POST acepta `detalle: [{ medicamento, dosis, presentacion, cantidad, indicaciones }]` y retorna la receta completa con detalles.

#### Documentos Emitidos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/bitacoras/[id]/documentos` | `apps/web/src/app/api/bitacoras/[id]/documentos/route.ts` | Lista documentos emitidos |

**Base de datos:** `uapp_documentos_emitidos`

#### Adjuntos

| Método | Ruta | Archivo | Función |
|--------|------|---------|---------|
| GET | `/api/bitacoras/[id]/adjuntos` | `apps/web/src/app/api/bitacoras/[id]/adjuntos/route.ts` | Lista adjuntos de la bitácora |
| POST | `/api/bitacoras/[id]/adjuntos` | mismo archivo | Sube archivo a R2 y crea registro |
| DELETE | `/api/bitacoras/adjuntos/[id]` | `apps/web/src/app/api/bitacoras/adjuntos/[id]/route.ts` | Elimina adjunto de R2 y BD |

**Base de datos:** `uapp_adjuntos`
**Nota:** POST usa S3 fetch directo (NO la librería `@/lib/r2`).

---

### 2.8 Usuarios

Gestión de cuentas de usuario del sistema (staff).

#### `GET /api/usuarios`
- **Archivo:** `apps/web/src/app/api/usuarios/route.ts`
- **Auth:** Bearer token + `requireRoot`
- **Respuesta:** `{ data: [{ rut, nombre, paterno, materno, perfil, correo, rut_empresa, empresa_nombre, estado }] }`
- **Función:** Lista todos los usuarios. Root ve todos; otros perfiles ven solo los de su empresa. Campo `password` excluido.
- **Base de datos:** `uapp_usuarios`

#### `POST /api/usuarios`
- **Auth:** Root requerido
- **Body:** `{ rut, nombre, paterno, materno, perfil, correo, password, rut_empresa? }`
- **Función:** Crea usuario. Password se hashea con bcrypt (10 rounds).

#### `PATCH /api/usuarios`
- **Auth:** Root requerido
- **Body:** `{ rut, ...campos, password? }`
- **Función:** Actualiza usuario. Si se incluye password, se re-hashea.

#### `DELETE /api/usuarios?rut=X`
- **Auth:** Root requerido
- **Respuesta:** `{ success: true }`
- **Función:** Elimina un usuario.

#### `POST /api/usuarios/verificar-clave`
- **Archivo:** `apps/web/src/app/api/usuarios/verificar-clave/route.ts`
- **Auth:** Ninguno
- **Body:** `{ rut: string, password: string }`
- **Respuesta:** `{ success: true }` o error 401
- **Función:** Verifica la contraseña de un usuario sin iniciar sesión. Usado para flujos de "verificar identidad antes de acción sensible".

---

### 2.9 Empresas

Entidades multi-tenant que agrupan todos los datos del sistema.

#### `GET /api/empresas`
- **Archivo:** `apps/web/src/app/api/empresas/route.ts`
- **Auth:** Bearer token (Root para lista completa)
- **Respuesta:** `{ data: [{ rut_empresa, nombre, giro, direccion, comuna, ciudad, telefono, email, logo_url, estado }] }`
- **Función:** Lista empresas. `estado` mapeado a `"activo" / "inactivo"`.
- **Base de datos:** `uapp_empresas`

#### `POST /api/empresas`
- **Auth:** Root requerido
- **Función:** Crea una nueva empresa.

#### `PATCH /api/empresas`
- **Auth:** Root requerido
- **Body:** `{ rut_empresa, ...campos }`
- **Función:** Actualiza datos de la empresa.

#### `DELETE /api/empresas?rut_empresa=X`
- **Auth:** Root requerido
- **Función:** Eliminación lógica (setea `estado = false`).

---

### 2.10 Maestros / Catálogos

CRUD para tablas maestras del sistema.

#### Tipos de Atención (`uapp_tipos_horas`)
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/tipos-horas` | `apps/web/src/app/api/tipos-horas/route.ts` | Lista tipos de consulta/atención |
| POST | `/api/tipos-horas` | mismo archivo | Crea tipo de atención |
| PATCH | `/api/tipos-horas` | mismo archivo | Actualiza tipo de atención |
| DELETE | `/api/tipos-horas` | mismo archivo | Elimina tipo de atención |

**Campo `estado`** mapeado a `"activo" / "inactivo"`.

#### Previsiones (Salud)
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/previsiones` | `apps/web/src/app/api/previsiones/route.ts` | Lista previsions de salud (Fonasa, Isapres) |
| POST | `/api/previsiones` | mismo archivo | Crea previsión |
| PATCH | `/api/previsiones` | mismo archivo | Actualiza previsión |
| DELETE | `/api/previsiones` | mismo archivo | Elimina previsión |

**Base de datos:** `uapp_previsiones`. **Campo `estado`** mapeado a `"activo" / "inactivo"`.

#### Horarios (Bloques de Atención)
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/horarios` | `apps/web/src/app/api/horarios/route.ts` | Lista bloques horarios disponibles |
| POST | `/api/horarios` | mismo archivo | Crea bloque horario |
| PATCH | `/api/horarios` | mismo archivo | Actualiza bloque horario |
| DELETE | `/api/horarios` | mismo archivo | Elimina bloque horario |

**Base de datos:** `uapp_horarios`. **Campo `activo`** mapeado a `"activo" / "inactivo"`.

#### Días Bloqueados
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/dias-bloqueados` | `apps/web/src/app/api/dias-bloqueados/route.ts` | Lista días completos sin atención |
| POST | `/api/dias-bloqueados` | mismo archivo | Bloquea un día completo |
| DELETE | `/api/dias-bloqueados` | mismo archivo | Desbloquea un día |

**Base de datos:** `uapp_dias_bloqueados`. Clave compuesta: `(fecha, rut_empresa)`.

#### Horas Bloqueadas
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/horas-bloqueadas` | `apps/web/src/app/api/horas-bloqueadas/route.ts` | Lista bloques horarios bloqueados |
| POST | `/api/horas-bloqueadas` | mismo archivo | Bloquea un horario específico |
| DELETE | `/api/horas-bloqueadas` | mismo archivo | Desbloquea un horario |

**Base de datos:** `uapp_horas_bloqueadas`. Query opcional: `fecha`. Unicidad: `(fecha, hora, rut_empresa)`.

#### Medicamentos
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/medicamentos` | `apps/web/src/app/api/medicamentos/route.ts` | Lista medicamentos con categoría |
| POST | `/api/medicamentos` | mismo archivo | Crea medicamento |
| PATCH | `/api/medicamentos` | mismo archivo | Actualiza medicamento |
| DELETE | `/api/medicamentos` | mismo archivo | Elimina medicamento |

**Base de datos:** `uapp_medicamentos`, `uapp_categorias_medicamentos`

#### Categorías de Medicamentos
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/categorias-medicamentos` | `apps/web/src/app/api/categorias-medicamentos/route.ts` | Lista categorías |
| POST | `/api/categorias-medicamentos` | mismo archivo | Crea categoría |

**Base de datos:** `uapp_categorias_medicamentos`

#### Kardex (Inventario)
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/kardex` | `apps/web/src/app/api/kardex/route.ts` | Lista artículos de inventario |
| POST | `/api/kardex` | mismo archivo | Crea artículo |
| PATCH | `/api/kardex` | mismo archivo | Actualiza artículo |
| DELETE | `/api/kardex` | mismo archivo | Elimina artículo |

**Base de datos:** `uapp_kardex`

#### Permisos
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/permisos?rut_empresa=X` | `apps/web/src/app/api/permisos/route.ts` | Obtiene matriz de permisos por empresa |
| PUT | `/api/permisos` | mismo archivo | Reemplaza todos los permisos de un perfil |

**Base de datos:** `uapp_permisos`
**PUT Body:** `{ rut_empresa, perfil: number, items: [{ id_item, nombre }] }`
**Nota:** PUT elimina todos los permisos existentes del perfil e inserta los nuevos (reemplazo completo).

---

### 2.11 Chat

Sistema de comunicación paciente-staff con eventos Server-Sent Events (SSE) en tiempo real.

#### `POST /api/chat/start`
- **Archivo:** `apps/web/src/app/api/chat/start/route.ts`
- **Auth:** Público
- **Body:** `{ nombre: string, email?: string, rut_empresa: string }`
- **Respuesta:** `{ id: string, token: string }`
- **Función:** Inicia una nueva conversación de chat para un paciente. Retorna ID de conversación y token de paciente para autenticación posterior.

#### `GET /api/chat/conversations?status=open`
- **Archivo:** `apps/web/src/app/api/chat/conversations/route.ts`
- **Auth:** Bearer token (staff)
- **Query:** `status` (default: `"open"`)
- **Respuesta:** `{ data: [{ id, paciente_nombre, paciente_email, status, unread_messages, last_message, last_message_at, created_at }] }`
- **Función:** Lista conversaciones activas para la empresa del staff autenticado, con el último mensaje de cada una.

#### `PATCH /api/chat/conversations/[id]`
- **Archivo:** `apps/web/src/app/api/chat/conversations/[id]/route.ts`
- **Auth:** Bearer token (staff)
- **Body:** `{ status?: "open" | "closed", mark_read?: boolean }`
- **Función:** Actualiza estado de conversación o marca mensajes como leídos.

#### `GET /api/chat/conversations/[id]/messages`
- **Archivo:** `apps/web/src/app/api/chat/conversations/[id]/messages/route.ts`
- **Auth:** Bearer token (staff) o query param `token` (paciente)
- **Query:** `token` (token de paciente), `since` (ISO date, para polling)
- **Respuesta:** `{ data: [{ id, sender, content, type, sender_name, created_at }] }`
- **Función:** Obtiene mensajes de una conversación. Los pacientes ven solo `type: "message"`; el staff ve también `type: "internal_note"`.

#### `POST /api/chat/messages`
- **Archivo:** `apps/web/src/app/api/chat/messages/route.ts`
- **Auth:** Bearer token (staff) o `token` en body (paciente)
- **Body:** `{ conversation_id, content, sender, token?, type?, sender_name? }`
- **Función:** Envía un mensaje. Staff puede enviar `type: "internal_note"`. Incrementa `unread_messages` para mensajes de paciente.

#### `GET /api/chat/conversations/[id]/stream`
- **Archivo:** `apps/web/src/app/api/chat/conversations/[id]/stream/route.ts`
- **Auth:** Token de paciente vía query param
- **Query:** `token` (token de paciente)
- **Respuesta:** `text/event-stream`
- **Función:** Endpoint SSE. El paciente recibe en tiempo real mensajes nuevos del staff (polling cada 3s). Se cierra cuando la conversación se cierra.

#### `GET /api/chat/staff/stream`
- **Archivo:** `apps/web/src/app/api/chat/staff/stream/route.ts`
- **Auth:** Cookie `token` (vía `getServerAuth`)
- **Respuesta:** `text/event-stream`
- **Función:** Endpoint SSE para staff. Recibe nuevas conversaciones y mensajes de pacientes en tiempo real (polling cada 3s).

---

### 2.12 Configuración

Gestión de categorías y subcategorías de documentos.

#### Categorías de Documentos
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/categorias-documentos` | `apps/web/src/app/api/categorias-documentos/route.ts` | Lista categorías con subcategorías |
| POST | `/api/categorias-documentos` | mismo archivo | Crea categoría (Root) |
| PATCH | `/api/configuracion/categorias-documentos/[id]` | `apps/web/src/app/api/configuracion/categorias-documentos/[id]/route.ts` | Actualiza categoría |
| DELETE | `/api/configuracion/categorias-documentos/[id]` | mismo archivo | Elimina categoría (Root) |

#### Subcategorías de Documentos
| Método | Ruta | Archivo | Descripción |
|--------|------|---------|-------------|
| GET | `/api/configuracion/categorias-documentos/[id]/subcategorias` | `apps/web/src/app/api/configuracion/categorias-documentos/[id]/subcategorias/route.ts` | Lista subcategorías |
| POST | `/api/configuracion/categorias-documentos/[id]/subcategorias` | mismo archivo | Crea subcategoría (Root) |
| PATCH | `/api/configuracion/subcategorias/[id]` | `apps/web/src/app/api/configuracion/subcategorias/[id]/route.ts` | Actualiza subcategoría |
| DELETE | `/api/configuracion/subcategorias/[id]` | mismo archivo | Elimina subcategoría |

**Base de datos:** `uapp_document_categories`, `uapp_document_subcategories`

---

## 3. Server Actions

Funciones ejecutadas en el servidor mediante la directiva `"use server"`. Encapsulan lógica de negocio para flujos complejos.

### `lib/booking-actions.ts`
**Archivo:** `apps/web/src/lib/booking-actions.ts`

| Función | Descripción |
|---------|-------------|
| `getAvailableSlots(rut_empresa, dateStr)` | Calcula bloques horarios disponibles para una fecha. Considera horarios configurados, días bloqueados, horas bloqueadas y citas existentes. Retorna `{ slots: AvailableSlot[], error? }` |
| `createBooking(data)` | Flujo de booking público: crea o actualiza paciente y crea la cita. Retorna `{ ok, error? }` |
| `getPatientByRut(rut_empresa, rut)` | Busca paciente por clave compuesta `(rut, rut_empresa)` |
| `getPrevisiones(rut_empresa)` | Lista previsiones activas de una empresa |

### `lib/blacklist-actions.ts`
**Archivo:** `apps/web/src/lib/blacklist-actions.ts`

| Función | Descripción |
|---------|-------------|
| `recalcularNoShows(rut_empresa, rut)` | Cuenta inasistencias (citas confirmadas no atendidas y pasadas). Auto-bloquea después de 3. Retorna `BlacklistStatus` |
| `getBlacklisted(rut_empresa)` | Lista todos los pacientes en lista negra de una empresa |
| `unblacklist(rut_empresa, rut)` | Remueve un paciente de la lista negra |

---

## 4. Modelos de Base de Datos

**Archivo:** `packages/database/prisma/schema.prisma`
**Motor:** PostgreSQL vía `@prisma/adapter-pg`
**Cliente:** Singleton en `packages/database/src/client.ts`

### Modelos del Sistema

| Modelo (Tabla) | Descripción | Relaciones Clave |
|----------------|-------------|------------------|
| `uapp_usuarios` | Cuentas de usuario del sistema (staff) | → `uapp_empresas` |
| `uapp_empresas` | Empresas/entidades multi-tenant | Padre de casi todas las tablas |
| `uapp_parametros` | Parámetros de configuración clave-valor | — |
| `uapp_logs` | Registro de errores y eventos del sistema | — |
| `uapp_reportes_config` | Configuración de layouts de reportes | — |
| `uapp_permisos` | Matriz de permisos por perfil | → `uapp_empresas` |
| `uapp_medicamentos` | Catálogo de medicamentos | → `uapp_categorias_medicamentos`, `uapp_empresas` |
| `uapp_categorias_medicamentos` | Categorías de medicamentos | → `uapp_empresas`, `uapp_medicamentos` |
| `uapp_kardex` | Inventario/stock de artículos | → `uapp_empresas` |

### Modelos de Pacientes y Agenda

| Modelo (Tabla) | Descripción | Relaciones Clave |
|----------------|-------------|------------------|
| `uapp_pacientes` | Registro de pacientes. PK compuesta: `(rut, rut_empresa)` | → `uapp_previsiones`, `uapp_empresas`, `uapp_fichas_clinicas`, `uapp_horas` |
| `uapp_horas` | Citas programadas | → `uapp_pacientes`, `uapp_previsiones`, `uapp_empresas`, `uapp_tipos_horas` |
| `uapp_horarios` | Bloques horarios de atención disponibles | → `uapp_empresas` |
| `uapp_tipos_horas` | Tipos de consulta/atención | → `uapp_empresas` |
| `uapp_previsiones` | Previsiones de salud (Fonasa, Isapres) | → `uapp_empresas`, `uapp_horas`, `uapp_pacientes` |
| `uapp_dias_bloqueados` | Días completos sin atención. PK compuesta: `(fecha, rut_empresa)` | → `uapp_empresas` |
| `uapp_horas_bloqueadas` | Bloques horarios específicos bloqueados. Unique: `(fecha, hora, rut_empresa)` | → `uapp_empresas` |

### Modelos de Fichas Clínicas

| Modelo (Tabla) | Descripción | Relaciones Clave |
|----------------|-------------|------------------|
| `uapp_fichas_clinicas` | Expediente clínico. Una por paciente por empresa | → `uapp_pacientes`, `uapp_empresas`. Padre de múltiples tablas |
| `uapp_bitacoras` | Notas clínicas de cada atención | → `uapp_fichas_clinicas`. Padre de múltiples tablas |
| `uapp_ante_personales` | Antecedentes personales (diabetes, HTA, etc.). Unique: `(id_ficha, tipo)` | → `uapp_fichas_clinicas` |
| `uapp_ante_quirurgicos` | Antecedentes quirúrgicos (cirugías previas) | → `uapp_fichas_clinicas` |
| `uapp_ante_familiares` | Antecedentes familiares | → `uapp_fichas_clinicas` |
| `uapp_alergias` | Alergias (medicamentos, alimentos, látex, otros) | → `uapp_fichas_clinicas` |
| `uapp_medicacion_cronica` | Medicación de uso crónico | → `uapp_fichas_clinicas` |
| `uapp_problemas_activos` | Problemas activos con código CIE-10 opcional | → `uapp_fichas_clinicas` |
| `uapp_habitos` | Hábitos (tabaco, alcohol, ejercicio, sueño). One-to-one con ficha | → `uapp_fichas_clinicas` |
| `uapp_recetas` | Recetas médicas | → `uapp_bitacoras`, `uapp_recetas_detalle` |
| `uapp_recetas_detalle` | Detalle (items) de una receta | → `uapp_recetas` |
| `uapp_diagnosticos` | Diagnósticos vinculados a una nota clínica | → `uapp_bitacoras` |
| `uapp_ordenes_medicas` | Órdenes médicas (lab, imágenes, procedimientos, etc.) | → `uapp_bitacoras` |
| `uapp_procedimientos` | Procedimientos realizados | → `uapp_bitacoras` |
| `uapp_documentos_emitidos` | Documentos generados (recetas, certificados, interconsultas) | → `uapp_bitacoras` |
| `uapp_adjuntos` | Archivos adjuntos a notas clínicas | → `uapp_bitacoras` |
| `uapp_archivos_generales` | Archivos generales adjuntos a fichas, categorizados | → `uapp_fichas_clinicas`, `uapp_document_subcategories` |
| `uapp_document_categories` | Categorías de documentos (ej: "Exámenes", "Informes") | → `uapp_document_subcategories` |
| `uapp_document_subcategories` | Subcategorías de documentos | → `uapp_document_categories`, `uapp_archivos_generales` |

### Modelos de Chat

| Modelo (Tabla) | Descripción | Relaciones Clave |
|----------------|-------------|------------------|
| `chat_conversations` | Sesiones de chat paciente-staff | → `uapp_empresas`, `chat_messages` |
| `chat_messages` | Mensajes individuales dentro de una conversación | → `chat_conversations` |

---

## 5. Tipos Compartidos (`@uapp/shared`)

**Archivo:** `packages/shared/src/index.ts`

### Validación de RUT

```typescript
const rutSchema: ZodSchema;        // /^\d{1,8}-[\dkK]$/
type Rut = string;                  // Tipo inferido
function validarRut(rut: string): boolean;  // Algoritmo módulo 11
```

### Perfiles

```typescript
enum Perfil {
  Root = 0,
  Asistente = 1,
  Administrador = 2,
  Profesional = 3,
}

const PERFIL_NOMBRES: Record<Perfil, string> = {
  [Perfil.Root]: "Root",
  [Perfil.Asistente]: "Asistente",
  [Perfil.Administrador]: "Administrador",
  [Perfil.Profesional]: "Profesional",
};

const PERFIL_ORDEN: Perfil[] = [1, 3, 2]; // Asistente, Profesional, Administrador
```

### Estado

```typescript
type EstadoRegistro = "activo" | "inactivo";
```

---

## 6. Librerías de Soporte

### `@/lib/verify-auth`
**Archivo:** `apps/web/src/lib/verify-auth.ts`

| Exportación | Descripción |
|-------------|-------------|
| `createToken(payload)` | Crea JWT con HS256, expiración 12h |
| `verifyAuth(req)` | Extrae y valida Bearer token del header `Authorization`. Retorna `JwtPayload` |
| `requireRoot(auth)` | Guard para endpoints exclusivos de Root. Retorna `{ ok: true, auth }` o `{ ok: false }` |

**Interfaces:**
```typescript
interface JwtPayload {
  rut: string;
  rut_empresa: string;
  perfil: number; // 0-3
}
```

### `@/lib/get-server-auth`
**Archivo:** `apps/web/src/lib/get-server-auth.ts`

| Exportación | Descripción |
|-------------|-------------|
| `getServerAuth()` | Lee JWT desde cookie `token` (httpOnly) en el servidor. Retorna `ServerAuthPayload \| null` |

### `@/lib/api-fetch`
**Archivo:** `apps/web/src/lib/api-fetch.ts`

| Exportación | Descripción |
|-------------|-------------|
| `apiFetch(url, options?)` | Wrapper fetch cliente. Adjunta automáticamente header `Authorization: Bearer <token>` desde `localStorage` (key: `uapp_token`) |

**Uso:** Todos los servicios de infraestructura de módulos usan esta función.

### `@/lib/r2`
**Archivo:** `apps/web/src/lib/r2.ts`
**Dependencias:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

| Exportación | Descripción |
|-------------|-------------|
| `uploadToR2(key, buffer, contentType)` | Sube archivo a Cloudflare R2 |
| `deleteFromR2(key)` | Elimina archivo de Cloudflare R2 |
| `getPresignedUrl(key, expiresIn?)` | Genera URL firmada de descarga (default: 3600s) |

---

## 7. Estructura de Módulos

Cada módulo sigue la arquitectura DDD con 4 capas:

```
src/modules/<nombre>/
├── domain/            ← Entidades puras, value objects, schemas Zod (sin dependencias React/Next)
├── application/       ← Hooks useServerXxx (patrón ServerDataTable) + casos de uso
├── infrastructure/    ← Servicios que llaman a API routes mediante apiFetch()
└── presentation/      ← Componentes React (páginas, tablas, formularios, sheets)
```

### Módulos del Sistema

| Módulo | Carpeta | Descripción | API Routes Consumidas |
|--------|---------|-------------|----------------------|
| **Agenda** | `agenda/` | Calendario de citas, vista mensual/diaria | `/api/agenda` |
| **Búsqueda Pacientes** | `busqueda-pacientes/` | Búsqueda rápida con autocompletado | `/api/busqueda-pacientes` |
| **Días Bloqueados** | `dias-bloqueados/` | Gestión de días sin atención | `/api/dias-bloqueados` |
| **Documentos Categorías** | `documentos-categorias/` | Configuración de categorías documentales | `/api/categorias-documentos`, `/api/configuracion/categorias-documentos`, `/api/configuracion/subcategorias` |
| **Empresas** | `empresas/` | CRUD de empresas/entidades | `/api/empresas` |
| **Fichas Clínicas** | `fichas-clinicas/` | Expediente clínico completo (30+ funciones) | Todas las rutas `/api/fichas/**` y `/api/bitacoras/**` |
| **Horarios** | `horarios/` | Bloques horarios de atención | `/api/horarios` |
| **Horas Bloqueadas** | `horas-bloqueadas/` | Bloques horarios específicos bloqueados | `/api/horas-bloqueadas` |
| **Kardex** | `kardex/` | Inventario de artículos/stock | `/api/kardex` |
| **Medicamentos** | `medicamentos/` | Catálogo de medicamentos con categorías | `/api/medicamentos`, `/api/categorias-medicamentos` |
| **Pacientes** | `pacientes/` | Registro maestro de pacientes | `/api/pacientes`, `/api/previsiones` |
| **Perfiles** | `perfiles/` | Matriz de permisos por perfil | `/api/permisos` |
| **Previsiones** | `previsiones/` | Previsiones de salud | `/api/previsiones` |
| **Tipos Atención** | `tipos-atencion/` | Tipos de consulta/atención | `/api/tipos-horas` |
| **Usuarios** | `usuarios/` | Cuentas de usuario del sistema | `/api/usuarios` |

---

## Resumen Estadístico

| Categoría | Cantidad |
|-----------|----------|
| Archivos de ruta API | ~58 |
| Endpoints individuales | ~120 |
| Modelos Prisma | 32 |
| Servicios de infraestructura | 15 |
| Hooks de aplicación (useCases) | 14 |
| Archivos Server Actions | 2 |
| Funciones Server Action | 9 |
| Librerías de soporte | 5 |
| Archivos totales en módulos | ~95 |
