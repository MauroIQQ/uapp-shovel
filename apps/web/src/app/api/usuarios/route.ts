import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";
import { PERFIL_NOMBRES, type Perfil } from "@uapp/shared";
import bcrypt from "bcryptjs";

import { requireRoot, verifyAuth } from "@/lib/verify-auth";

const SALT_ROUNDS = 10;

function mapUsuario(u: Record<string, unknown> & { perfil: number }) {
  return {
    ...u,
    perfil_nombre: PERFIL_NOMBRES[u.perfil as Perfil] ?? "Desconocido",
  };
}

export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const data = await prisma.uapp_usuarios.findMany({
    where: auth.perfil === 0 ? {} : { rut_empresa: auth.rut_empresa },
    omit: { password: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ data: data.map(mapUsuario) });
}

export async function POST(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { created, updated, ...body } = await req.json();
  const { password, rut_empresa: bodyEmpresa, ...rest } = body;

  if (!password) {
    return NextResponse.json({ error: "password es requerido" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const data = await prisma.uapp_usuarios.create({
    data: {
      ...rest,
      password: hashedPassword,
      rut_empresa: bodyEmpresa || auth.rut_empresa,
      updated: new Date(),
    },
    omit: { password: true },
  });

  return NextResponse.json({ data: mapUsuario(data) }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { rut, rut_empresa, created, updated, ...body } = await req.json();

  if (!rut) {
    return NextResponse.json({ error: "rut es requerido" }, { status: 400 });
  }

  const { password, ...rest } = body;

  const updateData: Record<string, unknown> = {
    ...rest,
    updated: new Date(),
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (rut_empresa) {
    updateData.rut_empresa = rut_empresa;
  }

  const data = await prisma.uapp_usuarios.update({
    where: { rut },
    data: updateData,
    omit: { password: true },
  });

  return NextResponse.json({ data: mapUsuario(data) });
}

export async function DELETE(req: Request) {
  const auth = await verifyAuth(req);
  if (!requireRoot(auth).ok) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const rut = searchParams.get("rut");

  if (!rut) {
    return NextResponse.json({ error: "rut es requerido" }, { status: 400 });
  }

  await prisma.uapp_usuarios.delete({ where: { rut } });

  return NextResponse.json({ success: true });
}
