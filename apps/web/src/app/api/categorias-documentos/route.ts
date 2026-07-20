import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

export async function GET() {
  const data = await prisma.uapp_document_categories.findMany({
    where: { activo: true },
    include: {
      subcategorias: {
        where: { activo: true },
        orderBy: { orden: "asc" },
      },
    },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json({ data });
}
