import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-auth";

function mapHorario(h: Record<string, unknown> & { activo: boolean }) {
  return { ...h, activo: h.activo ? "activo" : "inactivo" };
}

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const data = await prisma.uapp_horarios.findMany({
    where: { rut_empresa },
    orderBy: { hora: "asc" },
  });
  return NextResponse.json({ data: data.map(mapHorario) });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { created, updated, activo, ...body } = await req.json();
  const data = await prisma.uapp_horarios.create({
    data: { ...body, rut_empresa, updated: new Date() },
  });
  return NextResponse.json({ data: mapHorario(data) }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { id, created, updated, activo, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  const data = await prisma.uapp_horarios.update({
    where: { id },
    data: {
      ...rest,
      ...(activo !== undefined ? { activo: activo === "activo" } : {}),
      updated: new Date(),
    },
  });
  return NextResponse.json({ data: mapHorario(data) });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  await prisma.uapp_horarios.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
