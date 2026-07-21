import { NextResponse } from "next/server";
import { prisma } from "@uapp/database";
import { verifyAuth } from "@/lib/verify-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const since = searchParams.get("since");

  const conversation = await prisma.chat_conversations.findUnique({
    where: { id },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const auth = await verifyAuth(req);
  const isStaff = !!auth.rut_empresa;
  const isPatient = token && token === conversation.paciente_token;

  if (!isStaff && !isPatient) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const where: Record<string, unknown> = { conversation_id: id };
  if (since) {
    where.created_at = { gt: new Date(since) };
  }
  if (isPatient) {
    where.type = "message";
  }

  const messages = await prisma.chat_messages.findMany({
    where,
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      sender: true,
      content: true,
      type: true,
      sender_name: true,
      created_at: true,
    },
  });

  return NextResponse.json({ data: messages });
}
