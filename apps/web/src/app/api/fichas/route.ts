import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { searchParams } = new URL(req.url);
  const rut = searchParams.get("rut");
  if (!rut) return NextResponse.json({ error: "rut es requerido" }, { status: 400 });
  const ficha = await prisma.uapp_fichas_clinicas.findUnique({
    where: { rut_paciente_rut_empresa: { rut_paciente: rut, rut_empresa } },
  });
  if (!ficha) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ data: ficha });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { rut_paciente } = await req.json();
  if (!rut_paciente) return NextResponse.json({ error: "rut_paciente es requerido" }, { status: 400 });

  try {
    const data = await prisma.uapp_fichas_clinicas.create({
      data: { rut_paciente, rut_empresa, updated: new Date() },
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    const data = await prisma.uapp_fichas_clinicas.findUnique({
      where: { rut_paciente_rut_empresa: { rut_paciente, rut_empresa } },
    });
    return NextResponse.json({ data }, { status: 200 });
  }
}
