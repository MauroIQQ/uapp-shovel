import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";
import { requireRoot, verifyAuth } from "@/lib/verify-auth";

export async function GET() {
  const data = await prisma.uapp_document_categories.findMany({
    include: { subcategorias: { orderBy: { orden: "asc" } } },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_document_categories.create({
    data: { ...rest, updated: new Date() },
  });
  return NextResponse.json({ data }, { status: 201 });
}
