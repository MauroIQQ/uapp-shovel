import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_diagnosticos.findMany({
    where: { id_bitacora: Number(id) },
    orderBy: { created: "desc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_diagnosticos.create({
    data: { ...rest, id_bitacora: Number(id) },
  });
  return NextResponse.json({ data }, { status: 201 });
}
