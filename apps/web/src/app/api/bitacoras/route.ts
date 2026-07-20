import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ficha_id = searchParams.get("ficha_id");
  if (!ficha_id) return NextResponse.json({ error: "ficha_id es requerido" }, { status: 400 });
  const data = await prisma.uapp_bitacoras.findMany({
    where: { id_ficha_clinica: Number(ficha_id) },
    orderBy: { created: "desc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { created, updated, ...rest } = body;
  if (rest.proximo_control_fecha) {
    rest.proximo_control_fecha = new Date(rest.proximo_control_fecha + "T12:00:00Z");
  }
  const data = await prisma.uapp_bitacoras.create({
    data: { ...rest, updated: new Date() },
  });
  return NextResponse.json({ data }, { status: 201 });
}
