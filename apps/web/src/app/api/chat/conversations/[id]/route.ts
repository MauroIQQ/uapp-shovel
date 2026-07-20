import { NextResponse } from "next/server";
import { prisma } from "@uapp/database";
import { verifyAuth } from "@/lib/verify-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await verifyAuth(req);
  if (!auth.rut_empresa) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { status, mark_read } = body;

  const updateData: Record<string, unknown> = {};
  if (status === "open" || status === "closed") {
    updateData.status = status;
  }
  if (mark_read === true) {
    updateData.unread_messages = 0;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Sin campos válidos" }, { status: 400 });
  }

  const conversation = await prisma.chat_conversations.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    id: conversation.id,
    status: conversation.status,
    unread_messages: conversation.unread_messages,
  });
}
