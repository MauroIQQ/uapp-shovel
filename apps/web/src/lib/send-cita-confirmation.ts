"use server";

import { prisma } from "@uapp/database";

import { sendEmail } from "./email";
import { confirmacionTemplate } from "./email-templates";

export async function sendCitaConfirmation(citaId: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const cita = await prisma.uapp_horas.findUnique({
      where: { id: citaId },
      include: {
        uapp_pacientes: { select: { nombre_completo: true, correo: true } },
        uapp_empresas: { select: { giro: true, direccion: true } },
        uapp_direcciones: { select: { nombre: true, direccion: true, piso: true, oficina: true } },
      },
    });

    if (!cita) return { ok: false, error: "Cita no encontrada" };
    if (!cita.uapp_pacientes.correo) return { ok: false, error: "Paciente sin correo registrado" };

    const dateStr = cita.fecha_hora.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = cita.fecha_hora.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await sendEmail(
      cita.uapp_pacientes.correo,
      "Cita Confirmada",
      confirmacionTemplate({
        pacienteNombre: cita.uapp_pacientes.nombre_completo,
        fecha: dateStr,
        hora: timeStr,
        empresaNombre: cita.uapp_empresas.giro ?? cita.rut_empresa,
        empresaDireccion: cita.uapp_empresas.direccion,
        direccion: cita.uapp_direcciones ?? undefined,
      }),
    );

    await prisma.uapp_horas.update({
      where: { id: citaId },
      data: { recordatorio_creado: true },
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error al enviar confirmación" };
  }
}
