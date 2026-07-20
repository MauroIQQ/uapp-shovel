// Caso de uso: crear un nuevo registro
// Llama a la API Route, no tiene logica de React

import type { ExampleEntity } from "../domain/example.entity";

export interface CrearEjemploInput {
  nombre: string;
  email: string;
}

export async function crearEjemplo(input: CrearEjemploInput): Promise<ExampleEntity> {
  const res = await fetch("/api/ejemplos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error al crear" }));
    throw new Error(error.message ?? "Error al crear");
  }

  return res.json();
}
