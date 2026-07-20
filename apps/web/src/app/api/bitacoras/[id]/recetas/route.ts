import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_recetas.findMany({
    where: { id_bitacora: Number(id) },
    include: { uapp_recetas_detalle: true },
    orderBy: { created: "desc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { detalle, ...recetaData } = body;
  const data = await prisma.uapp_recetas.create({
    data: {
      id_bitacora: Number(id),
      ...recetaData,
      uapp_recetas_detalle: detalle?.length ? { create: detalle } : undefined,
    },
    include: { uapp_recetas_detalle: true },
  });
  return NextResponse.json({ data }, { status: 201 });
}
