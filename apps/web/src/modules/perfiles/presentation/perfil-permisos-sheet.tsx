"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { PermisoState } from "../domain/perfil.entity";
import { SISTEMA_GRUPOS, SISTEMA_MODULOS } from "../domain/perfil.entity";
import { updatePermisos } from "../infrastructure/perfiles.service";

interface PerfilPermisosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rut_empresa: string;
  perfil: number;
  perfilNombre: string;
  initialItems: PermisoState[];
  onSuccess: () => void;
}

export function PerfilPermisosSheet({
  open,
  onOpenChange,
  rut_empresa,
  perfil,
  perfilNombre,
  initialItems,
  onSuccess,
}: PerfilPermisosSheetProps) {
  const [items, setItems] = React.useState<PermisoState[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setItems(initialItems.map((i) => ({ ...i })));
    }
  }, [open, initialItems]);

  const allChecked = items.length > 0 && items.every((i) => i.checked);
  const someChecked = items.some((i) => i.checked);

  function handleToggle(id_item: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id_item === id_item ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  function handleSelectAll() {
    setItems((prev) => prev.map((item) => ({ ...item, checked: !allChecked })));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const selectedItems = items
        .filter((i) => i.checked)
        .map((i) => ({ id_item: i.id_item, nombre: i.nombre }));
      await updatePermisos(rut_empresa, perfil, selectedItems);
      onSuccess();
      onOpenChange(false);
    } catch {
      // error handled by caller
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Permisos: {perfilNombre}</SheetTitle>
          <SheetDescription>Empresa: {rut_empresa}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
          <div className="mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs"
            >
              {allChecked ? "Deseleccionar todo" : "Seleccionar todo"}
            </Button>
          </div>

          {SISTEMA_GRUPOS.map((grupo) => {
            const groupItems = SISTEMA_MODULOS.filter((m) => m.grupo === grupo);
            return (
              <div key={grupo} className="mb-4">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {grupo}
                </h3>
                <div className="space-y-1">
                  {groupItems.map((mod) => {
                    const state = items.find((i) => i.id_item === mod.id_item);
                    const checked = state?.checked ?? false;
                    return (
                      <label
                        key={mod.id_item}
                        className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <span className="text-sm font-medium">{mod.nombre}</span>
                        <Switch
                          checked={checked}
                          onCheckedChange={() => handleToggle(mod.id_item)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No hay módulos disponibles para configurar.
            </p>
          )}

          {!someChecked && items.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Sin permisos, este perfil no podrá acceder a ninguna sección.
            </p>
          )}
        </div>

        <SheetFooter className="px-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            <Save />
            Guardar cambios
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
