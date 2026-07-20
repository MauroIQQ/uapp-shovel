import { NextResponse } from "next/server";
import { prisma } from "@uapp/database";
import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  if (!rut_empresa) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "open";

  const conversations = await prisma.chat_conversations.findMany({
    where: { rut_empresa, status },
    include: {
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
    orderBy: { updated_at: "desc" },
  });

  const mapped = conversations.map((c) => ({
    id: c.id,
    paciente_nombre: c.paciente_nombre,
    paciente_email: c.paciente_email,
    status: c.status,
    unread_messages: c.unread_messages,
    last_message: c.messages[0]?.content || null,
    last_message_at: c.messages[0]?.created_at || c.created_at,
    created_at: c.created_at,
  }));

  return NextResponse.json({ data: mapped });
}
