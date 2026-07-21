import "dotenv/config";

import { prisma } from "@uapp/database";

async function main() {
  const rutEmpresa = process.argv[2] ?? "76140290-0";
  const now = new Date();
  const THRESHOLD = 3;

  const noShows = await prisma.uapp_horas.groupBy({
    by: ["rut_paciente"],
    where: {
      rut_empresa: rutEmpresa,
      confirmada: "SI",
      atendido: { not: "SI" },
      fecha_hora: { lt: now },
    },
    _count: { rut_paciente: true },
  });

  console.log(`Pacientes con inasistencias: ${noShows.length}`);

  let updated = 0;
  let blacklisted = 0;

  for (const ns of noShows) {
    const count = ns._count.rut_paciente;
    await prisma.uapp_pacientes.update({
      where: { rut_rut_empresa: { rut: ns.rut_paciente, rut_empresa: rutEmpresa } },
      data: { no_show_count: count, blacklisted: count >= THRESHOLD, updated: new Date() },
    });
    updated++;
    if (count >= THRESHOLD) blacklisted++;
  }

  console.log(`Actualizados: ${updated} | En lista negra: ${blacklisted}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
