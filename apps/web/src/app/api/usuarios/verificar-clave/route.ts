import { prisma } from "@uapp/database";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { rut, password } = await req.json();

  if (!rut || !password) {
    return NextResponse.json({ error: "RUT y password son requeridos" }, { status: 400 });
  }

  const user = await prisma.uapp_usuarios.findUnique({ where: { rut: String(rut) } });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
