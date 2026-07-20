import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_documentos_emitidos.findMany({
    where: { id_bitacora: Number(id) },
    orderBy: { created: "desc" },
  });
  return NextResponse.json({ data });
}
