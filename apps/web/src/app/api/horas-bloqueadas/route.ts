import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");

  const where: Record<string, unknown> = { rut_empresa };
  if (fecha) where.fecha = new Date(fecha);

  const data = await prisma.uapp_horas_bloqueadas.findMany({
    where,
    orderBy: { fecha: "desc" },
  });

  const mapped = data.map((d) => ({
    id: d.id,
    fecha: d.fecha.toISOString().slice(0, 10),
    hora: d.hora,
    motivo: d.motivo,
    created: d.created.toISOString(),
  }));

  return NextResponse.json({ data: mapped });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { fecha, hora, motivo } = await req.json();

  if (!fecha || !hora) {
    return NextResponse.json({ error: "fecha y hora son requeridos" }, { status: 400 });
  }

  const data = await prisma.uapp_horas_bloqueadas.create({
    data: {
      fecha: new Date(fecha),
      hora,
      rut_empresa,
      motivo: motivo ?? null,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: data.id,
        fecha: data.fecha.toISOString().slice(0, 10),
        hora: data.hora,
        motivo: data.motivo,
        created: data.created.toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function DELETE(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  const record = await prisma.uapp_horas_bloqueadas.findUnique({
    where: { id: Number(id) },
  });

  if (!record || record.rut_empresa !== rut_empresa) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.uapp_horas_bloqueadas.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
