import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_habitos.findUnique({ where: { id_ficha: Number(id) } });
  return NextResponse.json({ data: data ?? null });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_habitos.upsert({
    where: { id_ficha: Number(id) },
    update: { ...rest, updated: new Date() },
    create: { id_ficha: Number(id), ...rest },
  });
  return NextResponse.json({ data });
}
