// Servicio: capa de acceso a datos
// En API Routes se importa @uapp/database para Prisma
// En client components se usa fetch a API Routes

// Ejemplo de lo que seria una funcion server-side:
// import { prisma } from "@uapp/database";
//
// export async function buscarEjemplosEnDB() {
//   const rows = await prisma.$queryRawUnsafe("SELECT * FROM ejemplos LIMIT 20");
//   return rows;
// }

import type { ExampleEntity } from "../domain/example.entity";

// Mock: reemplazar con llamada real a API Route o Prisma
export async function buscarEjemplosMock(): Promise<ExampleEntity[]> {
  return [
    { id: "1", nombre: "Ejemplo 1", email: "ejemplo1@test.cl", estado: "activo", createdAt: new Date() },
    { id: "2", nombre: "Ejemplo 2", email: "ejemplo2@test.cl", estado: "inactivo", createdAt: new Date() },
  ];
}
