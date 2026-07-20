import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_fichas_clinicas.update({
    where: { id: Number(id) },
    data: { ...rest, updated: new Date() },
  });
  return NextResponse.json({ data });
}
