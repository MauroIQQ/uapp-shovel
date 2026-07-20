import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_bitacoras.findUnique({ where: { id: Number(id) } });
  if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  if (rest.proximo_control_fecha) {
    rest.proximo_control_fecha = new Date(rest.proximo_control_fecha + "T12:00:00Z");
  }
  const data = await prisma.uapp_bitacoras.update({
    where: { id: Number(id) },
    data: { ...rest, updated: new Date() },
  });
  return NextResponse.json({ data });
}
