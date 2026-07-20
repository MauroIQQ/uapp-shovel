import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

function parseNullable(value: string): string | null {
  if (!value || value.toUpperCase() === "NULL" || value.trim() === "") return null;
  return value;
}

function parseBoolean(value: string): boolean {
  if (!value || value.toUpperCase() === "NULL") return false;
  return value === "1";
}

function parseIntNullable(value: string): number | null {
  if (!value || value.toUpperCase() === "NULL" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function parseDate(value: string): Date {
  return new Date(value);
}

interface CsvRow {
  id: string;
  rut_empresa: string;
  total: string;
  rut_paciente: string;
  fecha_hora: string;
  id_tipo_consulta: string;
  observacion: string;
  estado: string;
  confirmada: string;
  num_llegada: string;
  atendido: string;
  sobrecupo: string;
  created: string;
  updated: string;
}

function parseCsvLine(line: string): CsvRow {
  const cols = line.split(";");
  if (cols.length < 14) {
    throw new Error(`Expected 14 columns, got ${cols.length}: ${line}`);
  }
  return {
    id: cols[0],
    rut_empresa: cols[1],
    total: cols[2],
    rut_paciente: cols[3],
    fecha_hora: cols[4],
    id_tipo_consulta: cols[5],
    observacion: cols[6],
    estado: cols[7],
    confirmada: cols[8],
    num_llegada: cols[9],
    atendido: cols[10],
    sobrecupo: cols[11],
    created: cols[12],
    updated: cols[13],
  };
}

async function main() {
  const csvPath = path.resolve(__dirname, "../../../", process.argv[2] || "C:/Users/mauro/Documents/horas.csv");
  console.log(`📂 Leyendo CSV: ${csvPath}`);

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  const data = lines.map((line) => {
    const row = parseCsvLine(line);
    return {
      rut_empresa: row.rut_empresa,
      rut_paciente: row.rut_paciente,
      fecha_hora: parseDate(row.fecha_hora),
      id_tipo_consulta: Number(row.id_tipo_consulta),
      observacion: parseNullable(row.observacion),
      estado: parseBoolean(row.estado),
      confirmada: parseNullable(row.confirmada),
      atendido: parseNullable(row.atendido),
      num_llegada: parseIntNullable(row.num_llegada) ?? 0,
      sobrecupo: parseBoolean(row.sobrecupo),
      total: parseIntNullable(row.total) ?? 0,
      created: parseDate(row.created),
      updated: parseDate(row.updated),
      origen: "org",
    };
  });

  console.log(`📊 ${data.length} filas parseadas. Verificando pacientes existentes...`);

  const existingPatients = await prisma.uapp_pacientes.findMany({
    where: { rut_empresa: data[0]?.rut_empresa },
    select: { rut: true },
  });
  const existingRuts = new Set(existingPatients.map((p) => p.rut));

  const missing = new Set<string>();
  for (const d of data) {
    if (!existingRuts.has(d.rut_paciente)) {
      missing.add(d.rut_paciente);
    }
  }

  if (missing.size > 0) {
    console.log(`⚠️  ${missing.size} pacientes no existen. Creando stubs...`);
    const now = new Date();
    await prisma.uapp_pacientes.createMany({
      data: Array.from(missing).map((rut) => ({
        rut,
        rut_empresa: data[0].rut_empresa,
        nombre_completo: `Paciente ${rut}`,
        estado: true,
        created: now,
        updated: now,
      })),
      skipDuplicates: true,
    });
    console.log(`✅ Stubs creados para ${missing.size} pacientes`);
  }

  console.log(`Insertando ${data.length} filas en uapp_horas...`);
  const result = await prisma.uapp_horas.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(`✅ ${result.count} filas insertadas`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
