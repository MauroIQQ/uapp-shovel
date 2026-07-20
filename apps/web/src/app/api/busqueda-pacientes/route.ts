import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const pacientes = await prisma.uapp_pacientes.findMany({
    where: {
      rut_empresa,
      AND: [
        {
          OR: [
            { rut: { contains: q, mode: "insensitive" } },
            { nombre_completo: { contains: q, mode: "insensitive" } },
          ],
        },
        { uapp_horas: { some: {} } },
      ],
    },
    include: {
      uapp_previsiones: true,
      uapp_horas: {
        orderBy: { fecha_hora: "desc" },
        take: 1,
        select: {
          fecha_hora: true,
          confirmada: true,
          atendido: true,
        },
      },
    },
    orderBy: { nombre_completo: "asc" },
    take: 50,
  });

  const mapped = pacientes.map((p) => ({
    rut: p.rut,
    nombre_completo: p.nombre_completo,
    sexo: p.sexo,
    fecha_nacimiento: p.fecha_nacimiento,
    edad: p.edad,
    telefono: p.telefono,
    celular: p.celular,
    correo: p.correo,
    prevision: p.uapp_previsiones?.nombre ?? null,
    ultima_cita: p.uapp_horas[0]?.fecha_hora ?? null,
    confirmada: p.uapp_horas[0]?.confirmada ?? null,
    atendido: p.uapp_horas[0]?.atendido ?? null,
  }));

  return NextResponse.json({ data: mapped });
}
