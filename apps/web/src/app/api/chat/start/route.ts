import { NextResponse } from "next/server";
import { prisma } from "@uapp/database";
import crypto from "crypto";

export async function POST(req: Request) {
  const { nombre, email, rut_empresa } = await req.json();

  if (!nombre?.trim() || !rut_empresa) {
    return NextResponse.json({ error: "Nombre y rut_empresa son requeridos" }, { status: 400 });
  }

  const token = crypto.randomBytes(24).toString("hex");

  const conversation = await prisma.chat_conversations.create({
    data: {
      rut_empresa,
      paciente_nombre: nombre.trim(),
      paciente_email: email?.trim() || null,
      paciente_token: token,
    },
  });

  return NextResponse.json({
    id: conversation.id,
    token: conversation.paciente_token,
  });
}
