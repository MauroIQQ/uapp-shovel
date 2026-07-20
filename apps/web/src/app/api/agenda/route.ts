import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-auth";

function mapCita(c: Record<string, unknown> & { estado: boolean }) {
  return {
    ...c,
    estado: c.estado ? "activo" : "inactivo",
  };
}

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha");
  const mes = searchParams.get("mes");

  if (mes) {
    const [year, month] = mes.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const rows = await prisma.uapp_horas.findMany({
      where: {
        rut_empresa,
        fecha_hora: { gte: start, lte: end },
      },
      select: { fecha_hora: true },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const d = row.fecha_hora.toISOString().slice(0, 10);
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }

    const bloqueados = await prisma.uapp_dias_bloqueados.findMany({
      where: {
        rut_empresa,
        fecha: { gte: start, lte: end },
      },
    });

    const bloqueadosMap = new Map(bloqueados.map((b) => [
      b.fecha.toISOString().slice(0, 10),
      b.motivo,
    ]));

    const allDates = new Set<string>([
      ...counts.keys(),
      ...bloqueadosMap.keys(),
    ]);

    const resumen = Array.from(allDates).map((fecha) => ({
      fecha,
      count: counts.get(fecha) ?? 0,
      bloqueado: bloqueadosMap.has(fecha),
      motivo: bloqueadosMap.get(fecha) ?? null,
    }));

    return NextResponse.json({ data: resumen });
  }

  if (!fecha) {
    return NextResponse.json({ error: "fecha o mes es requerido" }, { status: 400 });
  }

  const start = new Date(`${fecha}T00:00:00.000`);
  const end = new Date(`${fecha}T23:59:59.999`);

  const citas = await prisma.uapp_horas.findMany({
    where: {
      rut_empresa,
      fecha_hora: { gte: start, lte: end },
    },
    include: {
      uapp_pacientes: true,
      uapp_previsiones: true,
    },
    orderBy: { fecha_hora: "asc" },
  });

  const tipos = await prisma.uapp_tipos_horas.findMany({
    where: { rut_empresa },
  });
  const tipoMap = new Map(tipos.map((t) => [t.id, t.descripcion]));

  const mapped = citas.map((c) => ({
    ...c,
    estado: c.estado ? "activo" : "inactivo",
    paciente_nombre: c.uapp_pacientes.nombre_completo,
    prevision_nombre: c.uapp_previsiones?.nombre ?? null,
    tipo_descripcion: tipoMap.get(c.id_tipo_consulta) ?? "Desconocido",
  }));

  return NextResponse.json({ data: mapped });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { created, updated, estado, ...body } = await req.json();

  const data = await prisma.uapp_horas.create({
    data: {
      ...body,
      rut_empresa,
      updated: new Date(),
    },
  });

  return NextResponse.json({ data: mapCita(data) }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { id, created, updated, estado, ...rest } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_horas.update({
    where: { id },
    data: {
      ...rest,
      ...(estado !== undefined ? { estado: estado === "activo" ? true : false } : {}),
      updated: new Date(),
    },
  });

  return NextResponse.json({ data: mapCita(data) });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id es requerido" }, { status: 400 });
  }

  await prisma.uapp_horas.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
