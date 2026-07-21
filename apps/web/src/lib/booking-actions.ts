"use server";

import { prisma } from "@uapp/database";

export interface AvailableSlot {
  time: string
  label: string
}

export async function getAvailableSlots(
  rut_empresa: string,
  dateStr: string,
): Promise<{ slots: AvailableSlot[]; error?: string }> {
  try {
    const date = new Date(`${dateStr}T00:00:00.000Z`)

    const horarios = await prisma.uapp_horarios.findMany({
      where: { rut_empresa, activo: true },
      orderBy: { hora: "asc" },
    })

    if (horarios.length === 0) {
      return { slots: [], error: "No hay horarios disponibles para esta empresa" }
    }

    const bloqueado = await prisma.uapp_dias_bloqueados.findUnique({
      where: { fecha_rut_empresa: { fecha: date, rut_empresa } },
    })
    if (bloqueado) {
      return { slots: [], error: "Día bloqueado, no hay atención disponible" }
    }

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`)

    const ocupadas = await prisma.uapp_horas.findMany({
      where: {
        rut_empresa,
        fecha_hora: { gte: startOfDay, lte: endOfDay },
      },
      select: { fecha_hora: true },
    })

    const horasBloqueadas = await prisma.uapp_horas_bloqueadas.findMany({
      where: { rut_empresa, fecha: date },
    })
    const blockedTimes = new Set(horasBloqueadas.map((h) => h.hora))

    const occupiedTimes = new Set(
      ocupadas.map((h) => {
        const local = new Date(h.fecha_hora)
        return `${String(local.getHours()).padStart(2, "0")}:${String(local.getMinutes()).padStart(2, "0")}`
      }),
    )

    const now = new Date()
    const isToday = dateStr === now.toISOString().slice(0, 10)

    const slots: AvailableSlot[] = horarios
      .filter((h) => {
        if (blockedTimes.has(h.hora)) return false
        if (occupiedTimes.has(h.hora)) return false
        if (isToday) {
          const [hh, mm] = h.hora.split(":").map(Number)
          const slotDate = new Date(date)
          slotDate.setHours(hh, mm, 0, 0)
          if (slotDate <= now) return false
        }
        return true
      })
      .map((h) => ({
        time: h.hora,
        label: h.hora,
      }))

    return { slots }
  } catch (e) {
    return { slots: [], error: "Error al obtener horarios disponibles" }
  }
}

export interface CreateBookingInput {
  rut_empresa: string
  rut_paciente: string
  nombre_completo: string
  telefono: string
  correo?: string
  fecha_hora: string
  id_prevision?: number
}

export async function createBooking(data: CreateBookingInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const paciente = await prisma.uapp_pacientes.upsert({
      where: {
        rut_rut_empresa: { rut: data.rut_paciente, rut_empresa: data.rut_empresa },
      },
      update: {
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
        correo: data.correo ?? undefined,
      },
      create: {
        rut: data.rut_paciente,
        rut_empresa: data.rut_empresa,
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
        correo: data.correo ?? undefined,
        estado: true,
        updated: new Date(),
      },
    })

    const fechaHora = new Date(data.fecha_hora)

    await prisma.uapp_horas.create({
      data: {
        rut_empresa: data.rut_empresa,
        rut_paciente: paciente.rut,
        fecha_hora: fechaHora,
        id_prevision: data.id_prevision ?? null,
        origen: "pub",
        estado: true,
        confirmada: "NO",
        atendido: "NO",
        num_llegada: 0,
        sobrecupo: false,
        total: 0,
        updated: new Date(),
      },
    })

    return { ok: true }
  } catch (e) {
    return { ok: false, error: "Error al crear la reserva. Intente nuevamente." }
  }
}

export async function getPatientByRut(rut_empresa: string, rut: string) {
  try {
    const paciente = await prisma.uapp_pacientes.findUnique({
      where: { rut_rut_empresa: { rut, rut_empresa } },
      select: { nombre_completo: true, telefono: true, correo: true, id_prevision: true },
    })
    return paciente
  } catch {
    return null
  }
}

export async function getPrevisiones(rut_empresa: string) {
  return prisma.uapp_previsiones.findMany({
    where: { rut_empresa, estado: true },
    orderBy: { nombre: "asc" },
  })
}
