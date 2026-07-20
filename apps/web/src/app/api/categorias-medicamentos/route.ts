import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const data = await prisma.uapp_categorias_medicamentos.findMany({
    where: { rut_empresa },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { created, updated, ...body } = await req.json();
  const { nombre } = body;

  if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
    return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_categorias_medicamentos.create({
    data: {
      nombre: nombre.trim(),
      rut_empresa,
      updated: new Date(),
    },
  });

  return NextResponse.json({ data }, { status: 201 });
}
