import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

function mapPaciente(p: Record<string, unknown> & { estado: boolean }) {
  return {
    ...p,
    estado: p.estado ? "activo" : "inactivo",
  };
}

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const rut = searchParams.get("rut");

  if (rut) {
    const paciente = await prisma.uapp_pacientes.findUnique({
      where: { rut_rut_empresa: { rut, rut_empresa } },
    });

    if (!paciente) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: mapPaciente(paciente) });
  }

  const data = await prisma.uapp_pacientes.findMany({
    where: { rut_empresa },
    orderBy: { nombre_completo: "asc" },
  });

  return NextResponse.json({ data: data.map(mapPaciente) });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { estado, created, updated, fecha_nacimiento, ...body } = await req.json();
  const data = await prisma.uapp_pacientes.create({
    data: {
      ...body,
      ...(fecha_nacimiento ? { fecha_nacimiento: new Date(fecha_nacimiento) } : {}),
      estado: estado === "activo",
      rut_empresa,
      updated: new Date(),
    },
  });

  return NextResponse.json({ data: mapPaciente(data) }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { rut, estado, created, updated, fecha_nacimiento, ...rest } = await req.json();
  const data = await prisma.uapp_pacientes.update({
    where: { rut_rut_empresa: { rut, rut_empresa } },
    data: {
      ...rest,
      ...(estado !== undefined ? { estado: estado === "activo" } : {}),
      ...(fecha_nacimiento !== undefined
        ? { fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null }
        : {}),
      updated: new Date(),
    },
  });

  return NextResponse.json({ data: mapPaciente(data) });
}

export async function DELETE(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const rut = searchParams.get("rut");

  if (!rut) {
    return NextResponse.json({ error: "rut es requerido" }, { status: 400 });
  }

  await prisma.uapp_pacientes.delete({
    where: { rut_rut_empresa: { rut, rut_empresa } },
  });

  return NextResponse.json({ success: true });
}
