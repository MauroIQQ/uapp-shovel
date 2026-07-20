export interface PermisoItem {
  id_item: string;
  nombre: string;
  grupo: string;
}

export interface Permiso {
  id: number;
  perfil: number;
  rut_empresa: string;
  id_item: string;
  nombre: string;
  created: string;
}

export interface PermisoState {
  id_item: string;
  nombre: string;
  checked: boolean;
}

export const SISTEMA_MODULOS: PermisoItem[] = [
  { id_item: "pacientes", nombre: "Pacientes", grupo: "Asistencia" },
  { id_item: "medicamentos", nombre: "Medicamentos", grupo: "Profesional" },
  { id_item: "kardex", nombre: "Kardex", grupo: "Profesional" },
  { id_item: "config-usuarios", nombre: "Usuarios", grupo: "Configuración" },
  { id_item: "config-empresas", nombre: "Empresas", grupo: "Configuración" },
  { id_item: "config-perfiles", nombre: "Perfiles", grupo: "Configuración" },
  { id_item: "config-categorias-documentos", nombre: "Categorías Documentos", grupo: "Configuración" },
  { id_item: "agenda", nombre: "Agenda", grupo: "Asistencia" },
  { id_item: "busqueda-pacientes", nombre: "Búsqueda Pacientes", grupo: "Asistencia" },
  { id_item: "fichas-clinicas", nombre: "Fichas Clínicas", grupo: "Profesional" },
  { id_item: "config-previsiones", nombre: "Previsiones", grupo: "Administración" },
  { id_item: "config-horarios", nombre: "Horarios", grupo: "Administración" },
  { id_item: "config-tipos-horas", nombre: "Tipos de Atención", grupo: "Administración" },
  { id_item: "config-dias-bloqueados", nombre: "Días Bloqueados", grupo: "Administración" },
];

export const SISTEMA_GRUPOS: string[] = [...new Set(SISTEMA_MODULOS.map((m) => m.grupo))];
