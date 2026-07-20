import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { requireRoot, verifyAuth } from "@/lib/verify-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_document_subcategories.findMany({
    where: { id_categoria: Number(id) },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_document_subcategories.create({
    data: { ...rest, id_categoria: Number(id), updated: new Date() },
  });
  return NextResponse.json({ data }, { status: 201 });
}
