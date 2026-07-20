import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_problemas_activos.update({
    where: { id: Number(id) },
    data: rest,
  });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.uapp_problemas_activos.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
