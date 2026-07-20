import { prisma } from "@uapp/database";

import { getServerAuth } from "@/lib/get-server-auth";
import { AgendaPage } from "@/modules/agenda/presentation/agenda-page";

export const dynamic = "force-dynamic";

export default async function AgendaRoute() {
  const auth = await getServerAuth();
  if (!auth) return <AgendaPage tipos={[]} horarios={[]} resumen={[]} />;

  const { rut_empresa } = auth;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const [tipos, horarios, citasMes] = (await Promise.all([
    prisma.uapp_tipos_horas.findMany({
      where: { rut_empresa, estado: true },
      orderBy: { descripcion: "asc" },
    }),
    prisma.uapp_horarios.findMany({
      where: { rut_empresa, activo: true },
      orderBy: { hora: "asc" },
    }),
    prisma.uapp_horas.findMany({
      where: {
        rut_empresa,
        fecha_hora: { gte: start, lte: end },
      },
      select: { fecha_hora: true },
    }),
  ])) as [
    { id: number; descripcion: string; estado: boolean }[],
    { id: number; hora: string; activo: boolean }[],
    { fecha_hora: Date }[],
  ];

  const counts = new Map<string, number>();
  for (const c of citasMes) {
    const dateStr = c.fecha_hora.toISOString().slice(0, 10);
    counts.set(dateStr, (counts.get(dateStr) ?? 0) + 1);
  }

  const resumen = Array.from(counts.entries()).map(([fecha, count]) => ({
    fecha,
    count,
  }));

  return (
    <AgendaPage
      tipos={tipos.map((t) => ({ id: t.id, descripcion: t.descripcion, estado: t.estado }))}
      horarios={horarios.map((h) => ({ id: h.id, hora: h.hora, activo: h.activo }))}
      resumen={resumen}
    />
  );
}
