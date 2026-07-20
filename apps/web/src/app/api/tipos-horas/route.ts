import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

function mapTipo(h: Record<string, unknown> & { estado: boolean }) {
  return { ...h, estado: h.estado ? "activo" : "inactivo" };
}

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const data = await prisma.uapp_tipos_horas.findMany({
    where: { rut_empresa },
    orderBy: { descripcion: "asc" },
  });
  return NextResponse.json({ data: data.map(mapTipo) });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { created, updated, estado, ...body } = await req.json();
  const data = await prisma.uapp_tipos_horas.create({
    data: { ...body, rut_empresa, updated: new Date() },
  });
  return NextResponse.json({ data: mapTipo(data) }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { id, created, updated, estado, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  const data = await prisma.uapp_tipos_horas.update({
    where: { id },
    data: {
      ...rest,
      ...(estado !== undefined ? { estado: estado === "activo" } : {}),
      updated: new Date(),
    },
  });
  return NextResponse.json({ data: mapTipo(data) });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  await prisma.uapp_tipos_horas.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
