"use client";

import * as React from "react";

import { PERFIL_NOMBRES, type Perfil } from "@uapp/shared";
import { useShallow } from "zustand/react/shallow";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { type NavMainItem, sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarBrand } from "./sidebar-brand";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.values.sidebar_variant,
      sidebarCollapsible: s.values.sidebar_collapsible,
      isSynced: s.isSynced,
    })),
  );
  const [permisos, setPermisos] = React.useState<string[] | null>(null);
  const [empresaNombre, setEmpresaNombre] = React.useState("");

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  React.useEffect(() => {
    if (!user) return;
    if (user.perfil === 0) {
      setPermisos([]);
    } else {
      fetch(`/api/permisos?rut_empresa=${user.rut_empresa}`)
        .then((r) => (r.ok ? r.json() : { data: [] }))
        .then((json) => {
          const items = json.data
            .filter((p: { perfil: number }) => p.perfil === user.perfil)
            .map((p: { id_item: string }) => p.id_item);
          setPermisos(items);
        })
        .catch(() => setPermisos([]));
    }
    fetch("/api/empresas")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json) => {
        const emp = json.data.find((e: { rut_empresa: string }) => e.rut_empresa === user.rut_empresa);
        setEmpresaNombre(emp?.giro ?? user.rut_empresa);
      })
      .catch(() => setEmpresaNombre(user.rut_empresa));
  }, [user]);

  const CONFIG_ITEMS = ["config-usuarios", "config-empresas", "config-perfiles", "config-categorias-documentos"];

  function itemPermitido(id: string): boolean {
    if (!user) return false;
    if (CONFIG_ITEMS.includes(id)) return user.perfil === 0;
    if (user.perfil === 0) return true;
    if (permisos === null) return false;
    return permisos.includes(id);
  }

  function filtrarItems(items: NavMainItem[]): NavMainItem[] {
    const result: NavMainItem[] = [];
    for (const item of items) {
      if (item.subItems) {
        const subFiltrados = item.subItems.filter((s) => itemPermitido(s.id));
        if (subFiltrados.length > 0) {
          result.push({ ...item, subItems: subFiltrados });
        }
      } else if (itemPermitido(item.id)) {
        result.push(item);
      }
    }
    return result;
  }

  const itemsFiltrados = React.useMemo(
    () => sidebarItems.map((g) => ({ ...g, items: filtrarItems(g.items) })).filter((g) => g.items.length > 0),
    [filtrarItems],
  );

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={itemsFiltrados} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user ? `${user.nombre} ${user.paterno}` : "Usuario",
            email: user?.correo ?? user?.rut ?? "",
            avatar: "",
            company: user ? empresaNombre : "",
            perfil: user ? (PERFIL_NOMBRES[user.perfil as Perfil] ?? "Desconocido") : "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
