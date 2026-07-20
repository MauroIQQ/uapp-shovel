# Módulos del sistema

## Dashboard (`/dashboard/default`)
Página principal con métricas y gráficos:
- Dejar en blanco por ahora

## Pacientes (`/dashboard/pacientes`)
CRUD completo de pacientes:
- Búsqueda por RUT o nombre
- Campos: RUT, nombre, dirección, teléfono, sexo, fecha nacimiento, previsión, estado
- Filtro por sexo y estado
- Paginación, ordenamiento

## Agenda Vertical (`/dashboard/agenda-vertical`)
Tabla de citas con filtros:
- Confirmada (SI/NO), Atendido (SI/NO), Tipo de consulta, Turno (AM/PM)
- Búsqueda por texto
- Modal de creación/edición de cita con búsqueda de paciente
- Paginación

## Calendario (`/dashboard/calendar`)
Vista mensual con FullCalendar:
- Eventos con nombre del paciente, origen (público/interno)
- Click en día → sidebar con citas del día
- Crear/editar/eliminar citas
- Días bloqueados marcados en rojo
- Loading state con skeleton

## Atención (`/dashboard/atencion`)
Panel de atención médica:
- **Lista de pacientes**: pendientes/atendidos/todos, filtro por fecha
- **Ficha clínica**: peso, talla, IMC (auto), circunferencia cintura, pliegues, bioimpedancia, género, ocupación, contacto emergencia
- **Bitácora clínica**: modal con DataTable de bitácoras. Crear/editar con motivo + recetas (máx. 10 por bitácora). Límite: 200 bitácoras por paciente. Skeleton loading
- **Antecedentes**: médicos, familiares, alergias, medicamentos actuales, hábitos
- **Recetas**: autocompletado de medicamentos con búsqueda
- **Marcar como atendido**

## Previsiones (`/dashboard/prevision`)
CRUD de previsiones de salud:
- Campos: nombre, valor (CLP), estado (activo/inactivo)
- Batch delete con confirmación
- Filtro por estado

## Medicamentos (`/dashboard/medicamentos`)
CRUD de medicamentos + categorías:
- Búsqueda por autocompletado (usado en recetas)
- Cada medicamento pertenece a una categoría

## Usuarios (`/dashboard/usuarios`)
CRUD de usuarios del sistema:
- Perfiles: 0=Root, 1=Asistente, 2=Administrador
- Password hasheado con bcrypt

## Roles y Permisos (`/dashboard/roles-permisos`)
Asignación de permisos por perfil:
- Checkbox por cada item del menú lateral
- Se eliminan permisos anteriores y se reinsertan los seleccionados
- Perfil 0 (Root) tiene acceso total sin restricción

## Logs / Registro de Actividad (`/dashboard/logs`)
DataTable con eventos de auditoría:
- Columnas: ID, Nivel (badge), Origen, Módulo, Detalle, Usuario, Fecha
- Filtros por nivel (INFO/WARN/ERROR) y módulo
- Búsqueda por texto
- Detalle del evento en modal
- Origen: auditoría de operaciones CRUD

## Horarios (`/dashboard/horarios`)
Gestión de horarios disponibles para agendamiento:
- Hora, activo/inactivo
- Generación automática de slots

## Kardex (`/dashboard/kardex`)
Control de stock de medicamentos:
- CRUD de movimientos de kardex

## Tipos de Atención (`/dashboard/tipos-atencion`)
CRUD de tipos de consulta:
- Usado en el agendamiento de citas

## Días Bloqueados (`/dashboard/dias-bloqueados`)
Gestión de días no laborables:
- Se marcan en rojo en el calendario
- No permiten agendamiento

## Rendición (`/dashboard/rendicion`)
Reporte financiero por previsión:
- Agrupado por mes
- Totales: cantidad, subtotal, bruto, líquido (con 10% deducción)
- Descarga en PDF

## Empresa (`/dashboard/empresa`)
CRUD de empresas (tenants):
- Cada empresa tiene su propio `rut_empresa`

## Landing Pública (`/renacimiento`)
Página de bienvenida del centro médico:
- Hero con CTA "Reservar Hora"
- Cómo funciona (3 pasos)
- Beneficios
- Footer con contacto y horarios

## Booking Público (`/renacimiento/agendar`)
Flujo de agendamiento para pacientes:
- **Paso 1**: Seleccionar fecha (hoy → +2 meses) + elegir horario disponible
- **Paso 2**: Formulario: RUT, nombre, teléfono, previsión
- **Confirmación**: toast + pantalla de éxito
- Sin autenticación requerida
