"use server";

import { prisma } from "@uapp/database";

const NO_SHOW_THRESHOLD = 3;

export interface BlacklistStatus {
  blacklisted: boolean
  no_show_count: number
}

export interface BlacklistedPatient {
  rut: string
  nombre_completo: string
  telefono: string | null
  correo: string | null
  no_show_count: number
  updated: Date | null
}

export async function checkBlacklistStatus(
  rut_empresa: string,
  rut: string,
): Promise<BlacklistStatus> {
  const paciente = await prisma.uapp_pacientes.findUnique({
    where: { rut_rut_empresa: { rut, rut_empresa } },
    select: { no_show_count: true, blacklisted: true },
  })

  return {
    blacklisted: paciente?.blacklisted ?? false,
    no_show_count: paciente?.no_show_count ?? 0,
  }
}

export async function recalcularNoShows(
  rut_empresa: string,
  rut: string,
): Promise<BlacklistStatus> {
  const now = new Date()

  const noShows = await prisma.uapp_horas.count({
    where: {
      rut_empresa,
      rut_paciente: rut,
      confirmada: "SI",
      atendido: { not: "SI" },
      fecha_hora: { lt: now },
    },
  })

  const blacklisted = noShows >= NO_SHOW_THRESHOLD

  await prisma.uapp_pacientes.update({
    where: { rut_rut_empresa: { rut, rut_empresa } },
    data: { no_show_count: noShows, blacklisted, updated: new Date() },
  })

  return { blacklisted, no_show_count: noShows }
}

export async function getBlacklisted(
  rut_empresa: string,
): Promise<BlacklistedPatient[]> {
  const pacientes = await prisma.uapp_pacientes.findMany({
    where: { rut_empresa, blacklisted: true },
    select: {
      rut: true,
      nombre_completo: true,
      telefono: true,
      correo: true,
      no_show_count: true,
      updated: true,
    },
    orderBy: [{ no_show_count: "desc" }, { nombre_completo: "asc" }],
  })

  return pacientes
}

export async function unblacklist(rut_empresa: string, rut: string) {
  await prisma.uapp_pacientes.update({
    where: { rut_rut_empresa: { rut, rut_empresa } },
    data: { blacklisted: false, no_show_count: 0, updated: new Date() },
  })

  return { ok: true }
}
