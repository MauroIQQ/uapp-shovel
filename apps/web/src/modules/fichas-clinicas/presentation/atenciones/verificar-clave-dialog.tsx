"use client";

import * as React from "react";

import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface VerificarClaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export function VerificarClaveDialog({ open, onOpenChange, onVerified }: VerificarClaveDialogProps) {
  const [rut, setRut] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rut.trim() || !password) {
      setError("RUT y contraseña requeridos");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios/verificar-clave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut: rut.trim(), password }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Error al verificar");
        return;
      }

      onVerified();
      onOpenChange(false);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-4" />
            Verificar identidad
          </DialogTitle>
          <DialogDescription>Ingresa tu RUT y contraseña para confirmar la eliminación del archivo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <Field className="gap-1.5">
            <FieldLabel>RUT</FieldLabel>
            <Input
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Ej: 12345678-9"
              disabled={loading}
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel>Contraseña</FieldLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Verificando..." : "Verificar y eliminar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
