import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.uapp_recetas.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
