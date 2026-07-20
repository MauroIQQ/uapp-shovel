"use client";

import * as React from "react";

interface AuthUser {
  rut: string;
  nombre: string;
  paterno: string;
  materno: string | null;
  correo: string | null;
  perfil: number;
  rut_empresa: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (rut: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "uapp_user";
const TOKEN_KEY = "uapp_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const login = React.useCallback(async (rut: string, password: string): Promise<string | null> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut, password }),
    });

    const json = await res.json();
    if (!res.ok) return json.error ?? "Error al iniciar sesión";

    setUser(json.user);
    localStorage.setItem(USER_KEY, JSON.stringify(json.user));
    localStorage.setItem(TOKEN_KEY, json.token);
    return null;
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
