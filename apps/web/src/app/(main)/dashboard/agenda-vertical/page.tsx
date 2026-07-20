import { prisma } from "@uapp/database";
import { getServerAuth } from "@/lib/get-server-auth";
import { AgendaVerticalPage } from "@/modules/agenda/presentation/agenda-vertical-page";

export const dynamic = "force-dynamic";

export default async function AgendaVerticalRoute() {
  const auth = await getServerAuth();
  if (!auth) return <AgendaVerticalPage tipos={[]} horarios={[]} />;

  const { rut_empresa } = auth;

  const [tipos, horarios] = await Promise.all([
    prisma.uapp_tipos_horas.findMany({
      where: { rut_empresa, estado: true },
      orderBy: { descripcion: "asc" },
    }),
    prisma.uapp_horarios.findMany({
      where: { rut_empresa, activo: true },
      orderBy: { hora: "asc" },
    }),
  ]);

  return (
    <AgendaVerticalPage
      tipos={tipos.map((t) => ({ id: t.id, descripcion: t.descripcion, estado: t.estado }))}
      horarios={horarios.map((h) => ({ id: h.id, hora: h.hora, activo: h.activo }))}
    />
  );
}
