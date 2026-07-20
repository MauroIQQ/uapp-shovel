import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.uapp_ante_personales.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
