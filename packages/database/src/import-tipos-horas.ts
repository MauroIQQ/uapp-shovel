import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

interface CsvRow {
  id: number;
  rut_empresa: string;
  descripcion: string;
}

function parseCsvLine(line: string): CsvRow {
  const cols = line.split(";");
  if (cols.length < 3) {
    throw new Error(`Expected 3 columns, got ${cols.length}: ${line}`);
  }
  return {
    id: Number(cols[0]),
    rut_empresa: cols[1],
    descripcion: cols[2].trim(),
  };
}

async function main() {
  const csvPath = "C:/Users/mauro/Documents/tipos_horas.csv";
  console.log(`Leyendo CSV: ${csvPath}`);

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  const data = lines.map(parseCsvLine);

  console.log(`${data.length} filas parseadas. Eliminando datos existentes...`);

  await prisma.uapp_tipos_horas.deleteMany();

  console.log(`Datos existentes eliminados. Insertando ${data.length} registros...`);

  const now = new Date();
  const result = await prisma.uapp_tipos_horas.createMany({
    data: data.map((row) => ({
      id: row.id,
      rut_empresa: row.rut_empresa,
      descripcion: row.descripcion,
      estado: true,
      created: now,
      updated: now,
    })),
  });

  console.log(`${result.count} filas insertadas`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
