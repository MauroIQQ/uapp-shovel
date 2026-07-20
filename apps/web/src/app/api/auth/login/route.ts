import { prisma } from "@uapp/database";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createToken } from "@/lib/verify-auth";

export async function POST(req: Request) {
  const { rut, password } = await req.json();

  if (!rut || !password) {
    return NextResponse.json({ error: "RUT y password son requeridos" }, { status: 400 });
  }

  const user = await prisma.uapp_usuarios.findUnique({
    where: { rut: String(rut) },
  });

  if (!user) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await createToken({
    rut: user.rut,
    rut_empresa: user.rut_empresa,
    perfil: user.perfil,
  });

  return NextResponse.json({
    token,
    user: {
      rut: user.rut,
      nombre: user.nombre,
      paterno: user.paterno,
      materno: user.materno,
      correo: user.correo,
      perfil: user.perfil,
      rut_empresa: user.rut_empresa,
    },
  });
}
