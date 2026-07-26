import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";
import { confirmacionTemplate, recordatorioTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const test = searchParams.get("test");

  if (test) {
    try {
      await sendEmail(test, "Test SMTP - UAPP Shovel", confirmacionTemplate({
        pacienteNombre: "Paciente de Prueba",
        fecha: "26 de julio de 2026",
        hora: "15:00",
        empresaNombre: "UAPP Shovel",
      }));
      return NextResponse.json({ ok: true, message: `Email de prueba enviado a ${test}` });
    } catch (err) {
      return NextResponse.json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }, { status: 500 });
    }
  }

  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const startWindow = new Date(in2h.getTime() - 10 * 60 * 1000);
  const endWindow = new Date(in2h.getTime() + 10 * 60 * 1000);

  const citas = await prisma.uapp_horas.findMany({
    where: {
      fecha_hora: { gte: startWindow, lte: endWindow },
      recordatorio_enviado: false,
      recordatorio_creado: true,
    },
    include: {
      uapp_pacientes: { select: { nombre_completo: true, correo: true } },
      uapp_empresas: { select: { giro: true } },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const cita of citas) {
    if (!cita.uapp_pacientes.correo) {
      await prisma.uapp_horas.update({
        where: { id: cita.id },
        data: { recordatorio_enviado: true },
      });
      continue;
    }

    const dateStr = cita.fecha_hora.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = cita.fecha_hora.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

    try {
      await sendEmail(
        cita.uapp_pacientes.correo,
        "📅 Recordatorio de Cita - 2 horas",
        recordatorioTemplate({
          pacienteNombre: cita.uapp_pacientes.nombre_completo,
          fecha: dateStr,
          hora: timeStr,
          empresaNombre: cita.uapp_empresas.giro ?? cita.rut_empresa,
        }),
      );

      await prisma.uapp_horas.update({
        where: { id: cita.id },
        data: { recordatorio_enviado: true },
      });

      sent++;
    } catch {
      errors.push(cita.id.toString());
    }
  }

  return NextResponse.json({
    checked: citas.length,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
