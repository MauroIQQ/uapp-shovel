import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { deleteFromR2 } from "@/lib/r2";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archivo = await prisma.uapp_archivos_generales.findUnique({ where: { id: Number(id) } });
  if (!archivo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (archivo.ruta) {
    await deleteFromR2(archivo.ruta).catch(() => {});
  }
  await prisma.uapp_archivos_generales.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
