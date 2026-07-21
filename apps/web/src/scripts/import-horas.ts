import "dotenv/config";

import { readFileSync } from "node:fs";
import { prisma } from "@uapp/database";

interface HoraRow {
  id: number
  rut_empresa: string
  id_tipo_consulta: number
  rut_paciente: string
  fecha_hora: Date
  id_prevision: number | null
  observacion: string | null
  estado: boolean
  confirmada: string | null
  num_llegada: number
  atendido: string | null
  sobrecupo: boolean
  origen: string
  total: number
  created: Date
  updated: Date
}

function parseValue(val: string): string | null {
  if (!val || val === "NULL" || val.trim() === "") return null
  return val.trim()
}

function parseIntOrNull(val: string): number | null {
  const v = parseValue(val)
  if (v === null) return null
  const n = Number.parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}

function parseIntOrDefault(val: string, def: number): number {
  const n = parseIntOrNull(val)
  return n !== null ? n : def
}

function parseBool(val: string): boolean {
  return val.trim() === "1"
}

function parseDate(val: string): Date {
  return new Date(val.trim())
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error("Uso: npx tsx src/scripts/import-horas.ts <path-to-csv>")
    process.exit(1)
  }

  const rutEmpresa = "76140290-0"
  const content = readFileSync(csvPath, "utf-8")
  const lines = content.split(/\r?\n/).filter(Boolean)

  const rows: HoraRow[] = lines.map((line) => {
    const cols = line.split(";")
    return {
      id: Number.parseInt(cols[0], 10),
      rut_empresa: cols[1]?.trim() ?? rutEmpresa,
      id_tipo_consulta: Number.parseInt(cols[2], 10) || 6,
      rut_paciente: cols[3]?.trim() ?? "",
      fecha_hora: parseDate(cols[4]),
      id_prevision: null,
      observacion: parseValue(cols[6]),
      estado: parseBool(cols[7]),
      confirmada: parseValue(cols[8]),
      num_llegada: parseIntOrDefault(cols[9], 0),
      atendido: parseValue(cols[10]) ?? "NO",
      sobrecupo: parseBool(cols[11]),
      origen: "org",
      total: 0,
      created: parseDate(cols[12]),
      updated: parseDate(cols[13]),
    }
  })

  console.log(`📄 Leídos ${rows.length} registros del CSV`)

  const existingPacientes = await prisma.uapp_pacientes.findMany({
    where: { rut_empresa: rutEmpresa },
    select: { rut: true },
  })
  const existingRuts = new Set(existingPacientes.map((p) => p.rut))
  console.log(`👤 Pacientes existentes para ${rutEmpresa}: ${existingRuts.size}`)

  const filtered = rows.filter((r) => existingRuts.has(r.rut_paciente))
  const skipped = rows.length - filtered.length
  if (skipped > 0) {
    console.log(`⚠️  Saltados ${skipped} registros (paciente no existe en DB)`)
  }

  const count = await prisma.uapp_horas.count({ where: { rut_empresa: rutEmpresa } })
  console.log(`🗑️  Registros existentes para ${rutEmpresa}: ${count}`)

  await prisma.uapp_horas.deleteMany({ where: { rut_empresa: rutEmpresa } })
  console.log("✅ Eliminados registros anteriores")

  const BATCH = 100
  let inserted = 0

  for (let i = 0; i < filtered.length; i += BATCH) {
    const batch = filtered.slice(i, i + BATCH)
    await prisma.uapp_horas.createMany({ data: batch })
    inserted += batch.length
    console.log(`  → Insertados ${inserted}/${filtered.length}`)
  }

  console.log(`\n🎉 Importación completada: ${inserted} registros en uapp_horas`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("❌ Error:", e)
  process.exit(1)
})
