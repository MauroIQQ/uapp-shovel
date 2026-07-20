import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const data = await prisma.uapp_dias_bloqueados.findMany({
    where: { rut_empresa },
    orderBy: { fecha: "desc" },
    select: { fecha: true, motivo: true, created: true },
  });

  const mapped = data.map((d) => ({
    fecha: d.fecha.toISOString().slice(0, 10),
    motivo: d.motivo,
    created: d.created.toISOString(),
  }));

  return NextResponse.json({ data: mapped });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { fecha, motivo } = await req.json();

  if (!fecha) {
    return NextResponse.json({ error: "fecha es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_dias_bloqueados.create({
    data: {
      fecha: new Date(fecha),
      rut_empresa,
      motivo: motivo ?? null,
    },
  });

  return NextResponse.json(
    {
      data: {
        fecha: data.fecha.toISOString().slice(0, 10),
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
  const fecha = searchParams.get("fecha");

  if (!fecha) {
    return NextResponse.json({ error: "fecha es requerido" }, { status: 400 });
  }

  await prisma.uapp_dias_bloqueados.delete({
    where: {
      fecha_rut_empresa: {
        fecha: new Date(fecha),
        rut_empresa,
      },
    },
  });

  return NextResponse.json({ success: true });
}
