# UAPP - Unidad de Atención y Programación de Pacientes

## Tipo de proyecto
Sistema de gestión de agendas médicas multi-tenant (SaaS) con landing pública para agendamiento online.

## Negocio
- Centro médico principal: **Renacimiento**
- Clientes futuros: Vidager, Medicos2, etc. (cada uno con su propio dominio y landing)
- Gestión completa: pacientes, citas, fichas clínicas, recetas, bitácoras, antecedentes
- Multi-tenant por `rut_empresa`: cada centro médico opera con datos separados en la misma BD

## Flujo de uso

### 1. Configuración inicial (Administrador)
- Crear empresa, usuarios, perfiles (Root / Administrador / Asistente)
- Configurar horarios disponibles, tipos de consulta, previsiones
- Asignar permisos de menú por perfil

### 2. Agendamiento (Recepcionista / Web pública)
- **Interno**: calendario FullCalendar o tabla vertical → modal de creación con búsqueda de paciente
- **Público**: landing `/renacimiento/agendar` → seleccionar fecha (hoy → +2 meses) → horario → formulario

### 3. Atención médica (Médico)
- Panel `/dashboard/atencion`: lista de pacientes del día
- Crear/editar ficha clínica (peso, talla, IMC, contacto emergencia)
- Registrar bitácora clínica con recetas (máx. 10 recetas por bitácora, 200 bitácoras por paciente)
- Registrar antecedentes médicos, familiares, alergias, medicamentos, hábitos
- Marcar paciente como atendido

### 4. Operaciones diarias
- Búsqueda global de pacientes
- Gestión de horas, kardex, días bloqueados
- Rendición de cuentas por previsión
- Reportes y certificados

### 5. Auditoría
- Cada operación CRUD queda registrada en `uapp_logs` con RUT del usuario
- Visualización en `/dashboard/logs` con DataTable y filtros
