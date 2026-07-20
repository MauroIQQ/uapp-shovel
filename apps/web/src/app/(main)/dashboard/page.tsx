import { prisma } from "@uapp/database";
import { getServerAuth } from "@/lib/get-server-auth";
import { DashboardCharts } from "./_components/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getServerAuth();
  if (!auth) return <DashboardCharts data={[]} />;

  const { rut_empresa } = auth;
  const now = new Date();
  const hace6m = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const rows = await prisma.uapp_horas.findMany({
    where: {
      rut_empresa,
      fecha_hora: { gte: hace6m, lte: now },
    },
    select: { fecha_hora: true, confirmada: true, atendido: true },
    orderBy: { fecha_hora: "asc" },
  });

  const data = rows.map((row) => ({
    fecha: row.fecha_hora.toISOString().slice(0, 10),
    atenciones: 1,
    confirmada: row.confirmada,
    atendido: row.atendido,
  }));

  return <DashboardCharts data={data} />;
}
