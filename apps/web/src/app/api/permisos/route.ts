import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { requireRoot, verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rut_empresa = searchParams.get("rut_empresa");

  if (!rut_empresa) {
    return NextResponse.json({ error: "rut_empresa es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_permisos.findMany({
    where: { rut_empresa },
    orderBy: [{ perfil: "asc" }, { id_item: "asc" }],
  });

  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { rut_empresa, perfil, items } = await req.json();

  if (!rut_empresa || perfil === undefined || !Array.isArray(items)) {
    return NextResponse.json({ error: "rut_empresa, perfil e items son requeridos" }, { status: 400 });
  }

  await prisma.uapp_permisos.deleteMany({
    where: { rut_empresa, perfil },
  });

  if (items.length > 0) {
    await prisma.uapp_permisos.createMany({
      data: items.map((item: { id_item: string; nombre: string }) => ({
        rut_empresa,
        perfil,
        id_item: item.id_item,
        nombre: item.nombre,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
