import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_medicacion_cronica.update({
    where: { id: Number(id) },
    data: rest,
  });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.uapp_medicacion_cronica.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
