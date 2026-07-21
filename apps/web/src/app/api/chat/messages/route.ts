import { NextResponse } from "next/server";
import { prisma } from "@uapp/database";
import { verifyAuth } from "@/lib/verify-auth";

export async function POST(req: Request) {
  const { conversation_id, content, sender, token, type, sender_name } = await req.json();

  if (!conversation_id || !content?.trim() || !sender) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const conversation = await prisma.chat_conversations.findUnique({
    where: { id: conversation_id },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  if (conversation.status === "closed") {
    return NextResponse.json({ error: "Conversación cerrada" }, { status: 400 });
  }

  const auth = await verifyAuth(req);
  const isStaff = !!auth.rut_empresa;
  const isPatient = token && token === conversation.paciente_token;

  if (!isStaff && !isPatient) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const msgType = type === "internal_note" && isStaff ? "internal_note" : "message";

  const message = await prisma.chat_messages.create({
    data: {
      conversation_id,
      sender,
      content: content.trim(),
      type: msgType,
      sender_name: sender_name || null,
    },
  });

  const updateData: Record<string, unknown> = { updated_at: new Date() };
  if (sender === "patient") {
    updateData.unread_messages = { increment: 1 };
  }
  await prisma.chat_conversations.update({
    where: { id: conversation_id },
    data: updateData,
  });

  return NextResponse.json({
    id: message.id,
    sender: message.sender,
    content: message.content,
    type: message.type,
    sender_name: message.sender_name,
    created_at: message.created_at,
  });
}
