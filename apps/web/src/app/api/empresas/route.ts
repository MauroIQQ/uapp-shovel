import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { requireRoot, verifyAuth } from "@/lib/verify-auth";

function mapEmpresa(e: Record<string, unknown> & { estado: boolean }) {
  return {
    ...e,
    estado: e.estado ? "activo" : "inactivo",
  };
}

export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok && auth.rut !== "") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const data = await prisma.uapp_empresas.findMany({
    orderBy: { rut_empresa: "asc" },
  });
  return NextResponse.json({ data: data.map(mapEmpresa) });
}

export async function POST(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { created, updated, estado, ...body } = await req.json();
  const data = await prisma.uapp_empresas.create({
    data: { ...body, estado: estado === "activo", updated: new Date() },
  });
  return NextResponse.json({ data: mapEmpresa(data) }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { rut_empresa, created, updated, estado, ...rest } = await req.json();
  if (!rut_empresa) return NextResponse.json({ error: "rut_empresa es requerido" }, { status: 400 });
  const data = await prisma.uapp_empresas.update({
    where: { rut_empresa },
    data: {
      ...rest,
      ...(estado !== undefined ? { estado: estado === "activo" } : {}),
      updated: new Date(),
    },
  });
  return NextResponse.json({ data: mapEmpresa(data) });
}

export async function DELETE(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const rut_empresa = searchParams.get("rut_empresa");
  if (!rut_empresa) return NextResponse.json({ error: "rut_empresa es requerido" }, { status: 400 });
  await prisma.uapp_empresas.update({
    where: { rut_empresa },
    data: { estado: false, updated: new Date() },
  });
  return NextResponse.json({ success: true });
}
