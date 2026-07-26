import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const queryRutEmpresa = searchParams.get("rut_empresa");
  const rut_empresa = queryRutEmpresa && auth.perfil === 0 ? queryRutEmpresa : auth.rut_empresa;

  const data = await prisma.uapp_direcciones.findMany({
    where: { rut_empresa },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const auth = await verifyAuth(req);
  const body = await req.json();
  const rut_empresa = body.rut_empresa && auth.perfil === 0 ? body.rut_empresa : auth.rut_empresa;

  if (!body.nombre || !body.direccion) {
    return NextResponse.json({ error: "nombre y direccion son requeridos" }, { status: 400 });
  }

  const data = await prisma.uapp_direcciones.create({
    data: {
      rut_empresa,
      nombre: body.nombre,
      direccion: body.direccion,
      piso: body.piso ?? null,
      oficina: body.oficina ?? null,
      comuna: body.comuna ?? null,
      ciudad: body.ciudad ?? null,
      activo: body.activo ?? true,
      updated: new Date(),
    },
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const body = await req.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  const record = await prisma.uapp_direcciones.findUnique({ where: { id } });
  if (!record || record.rut_empresa !== rut_empresa) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const data = await prisma.uapp_direcciones.update({
    where: { id },
    data: { ...rest, updated: new Date() },
  });

  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  const record = await prisma.uapp_direcciones.findUnique({ where: { id: Number(id) } });
  if (!record || record.rut_empresa !== rut_empresa) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.uapp_direcciones.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
