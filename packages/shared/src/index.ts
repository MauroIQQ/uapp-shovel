// Tipos y constantes compartidas entre todos los modulos de UAPP

import { z } from "zod";

// Rut chileno: 1-9 digitos + guion + digito verificador (numero o K)
export const rutSchema = z.string().regex(/^\d{1,8}-[\dkK]$/, "Rut invalido");

export type Rut = z.infer<typeof rutSchema>;

export function validarRut(rut: string): boolean {
  const limpio = rut.replace(/\./g, "");
  if (!/^\d{1,8}-[\dkK]$/i.test(limpio)) return false;
  const [cuerpo, dv] = limpio.split("-");
  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dvEsperado === dv.toUpperCase();
}

// Perfiles del sistema
export enum Perfil {
  Root = 0,
  Asistente = 1,
  Administrador = 2,
  Profesional = 3,
}

export const PERFIL_NOMBRES: Record<Perfil, string> = {
  [Perfil.Root]: "Root",
  [Perfil.Asistente]: "Asistente",
  [Perfil.Administrador]: "Administrador",
  [Perfil.Profesional]: "Profesional",
};

export const PERFIL_ORDEN: Perfil[] = [Perfil.Asistente, Perfil.Profesional, Perfil.Administrador];

// Estados genericos
export type EstadoRegistro = "activo" | "inactivo";
