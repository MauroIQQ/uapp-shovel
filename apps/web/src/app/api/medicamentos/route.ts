import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const data = await prisma.uapp_medicamentos.findMany({
    where: { rut_empresa },
    include: { uapp_categorias_medicamentos: true },
    orderBy: { nombre: "asc" },
  });

  const mapped = data.map((m) => ({
    ...m,
    categoria_nombre: m.uapp_categorias_medicamentos.nombre,
  }));

  return NextResponse.json({ data: mapped });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { created, updated, categoria_nombre, ...body } = await req.json();

  const data = await prisma.uapp_medicamentos.create({
    data: {
      ...body,
      rut_empresa,
      updated: new Date(),
    },
    include: { uapp_categorias_medicamentos: true },
  });

  return NextResponse.json(
    { data: { ...data, categoria_nombre: data.uapp_categorias_medicamentos.nombre } },
    { status: 201 },
  );
}

export async function PATCH(req: Request) {
  const { id, created, updated, categoria_nombre, ...rest } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_medicamentos.update({
    where: { id },
    data: { ...rest, updated: new Date() },
    include: { uapp_categorias_medicamentos: true },
  });

  return NextResponse.json({
    data: { ...data, categoria_nombre: data.uapp_categorias_medicamentos.nombre },
  });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  await prisma.uapp_medicamentos.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
