"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [rut, setRut] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rut.trim() || !password) {
      setError("RUT y contraseña son requeridos");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const err = await login(rut.trim(), password);
      if (err) {
        setError(err);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      <Field className="gap-1.5">
        <FieldLabel htmlFor="login-rut">RUT</FieldLabel>
        <Input
          id="login-rut"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          placeholder="Ej: 12345678-9"
          autoComplete="username"
          disabled={loading}
        />
      </Field>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={loading}
        />
      </Field>

      <Button className="w-full" type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
