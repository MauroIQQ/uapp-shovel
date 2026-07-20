import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";
import { requireRoot, verifyAuth } from "@/lib/verify-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const { created, updated, ...rest } = body;
  const data = await prisma.uapp_document_categories.update({
    where: { id: Number(id) },
    data: { ...rest, updated: new Date() },
  });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  await prisma.uapp_document_categories.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
