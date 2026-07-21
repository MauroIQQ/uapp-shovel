import {
  Building2,
  CalendarDays,
  CalendarX,
  Clock,
  Coins,
  FileText,
  FolderTree,
  LayoutDashboard,
  Lock,
  MessageSquare,
  type LucideIcon,
  Package,
  Pill,
  Search,
  Settings,
  ShieldBan,
  Table2,
  UserCog,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 0,
    items: [
      {
        id: "inicio",
        title: "Inicio",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 1,
    label: "Asistencia",
    items: [
      {
        id: "pacientes",
        title: "Pacientes",
        url: "/dashboard/pacientes",
        icon: Users,
      },
      {
        id: "agenda",
        title: "Agenda",
        url: "/dashboard/agenda",
        icon: CalendarDays,
      },
      {
        id: "agenda-vertical",
        title: "Agenda Vertical",
        url: "/dashboard/agenda-vertical",
        icon: Table2,
      },
      {
        id: "busqueda-pacientes",
        title: "Búsqueda Pacientes",
        url: "/dashboard/busqueda-pacientes",
        icon: Search,
      },
      {
        id: "mensajes",
        title: "Mensajes",
        url: "/dashboard/mensajes",
        icon: MessageSquare,
      },
    ],
  },
  {
    id: 4,
    label: "Administración",
    items: [
      {
        id: "config-previsiones",
        title: "Previsiones",
        url: "/dashboard/administracion/previsiones",
        icon: Coins,
      },
      {
        id: "config-horarios",
        title: "Horarios",
        url: "/dashboard/administracion/horarios",
        icon: Clock,
      },
      {
        id: "config-tipos-horas",
        title: "Tipos de Atención",
        url: "/dashboard/administracion/tipos-atencion",
        icon: FileText,
      },
      {
        id: "config-dias-bloqueados",
        title: "Días Bloqueados",
        url: "/dashboard/administracion/dias-bloqueados",
        icon: CalendarX,
      },
      {
        id: "config-horas-bloqueadas",
        title: "Horas Bloqueadas",
        url: "/dashboard/administracion/horas-bloqueadas",
        icon: Clock,
      },
      {
        id: "lista-negra",
        title: "Lista Negra",
        url: "/dashboard/lista-negra",
        icon: ShieldBan,
      },
    ],
  },
  {
    id: 3,
    label: "Profesional",
    items: [
      {
        id: "medicamentos",
        title: "Medicamentos",
        url: "/dashboard/profesional/medicamentos",
        icon: Pill,
      },
      {
        id: "kardex",
        title: "Kardex",
        url: "/dashboard/profesional/kardex",
        icon: Package,
      },
      {
        id: "fichas-clinicas",
        title: "Fichas Clínicas",
        url: "/dashboard/fichas",
        icon: FileText,
      },
    ],
  },
  {
    id: 2,
    items: [
      {
        id: "configuracion",
        title: "Configuración",
        icon: Settings,
        subItems: [
          {
            id: "config-usuarios",
            title: "Usuarios",
            url: "/dashboard/configuracion/usuarios",
            icon: UserCog,
          },
          {
            id: "config-empresas",
            title: "Empresas",
            url: "/dashboard/configuracion/empresas",
            icon: Building2,
          },
          {
            id: "config-perfiles",
            title: "Perfiles",
            url: "/dashboard/configuracion/perfiles",
            icon: Lock,
          },
          {
            id: "config-categorias-documentos",
            title: "Categorías Documentos",
            url: "/dashboard/configuracion/categorias-documentos",
            icon: FolderTree,
          },
        ],
      },
    ],
  },
];
