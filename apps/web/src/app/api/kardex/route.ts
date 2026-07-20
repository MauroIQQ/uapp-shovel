import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verify-auth";

export async function GET(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const data = await prisma.uapp_kardex.findMany({
    where: { rut_empresa },
    orderBy: { descripcion: "asc" },
  });

  const mapped = data.map((d) => ({
    id_articulo: d.id_articulo,
    descripcion: d.descripcion,
    stock_actual: d.stock_actual,
    created: d.created.toISOString(),
    updated: d.updated.toISOString(),
  }));

  return NextResponse.json({ data: mapped });
}

export async function POST(req: Request) {
  const { rut_empresa } = await verifyAuth(req);
  const { descripcion, stock_actual } = await req.json();

  if (!descripcion) {
    return NextResponse.json({ error: "descripcion es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_kardex.create({
    data: {
      descripcion,
      stock_actual: stock_actual ?? 0,
      rut_empresa,
      updated: new Date(),
    },
  });

  return NextResponse.json(
    {
      data: {
        id_articulo: data.id_articulo,
        descripcion: data.descripcion,
        stock_actual: data.stock_actual,
        created: data.created.toISOString(),
        updated: data.updated.toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function PATCH(req: Request) {
  const { id_articulo, descripcion, stock_actual } = await req.json();

  if (!id_articulo) {
    return NextResponse.json({ error: "id_articulo es requerido" }, { status: 400 });
  }

  const data = await prisma.uapp_kardex.update({
    where: { id_articulo },
    data: {
      ...(descripcion !== undefined && { descripcion }),
      ...(stock_actual !== undefined && { stock_actual }),
      updated: new Date(),
    },
  });

  return NextResponse.json({
    data: {
      id_articulo: data.id_articulo,
      descripcion: data.descripcion,
      stock_actual: data.stock_actual,
      created: data.created.toISOString(),
      updated: data.updated.toISOString(),
    },
  });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id_articulo");

  if (!id) {
    return NextResponse.json({ error: "id_articulo es requerido" }, { status: 400 });
  }

  await prisma.uapp_kardex.delete({
    where: { id_articulo: Number(id) },
  });

  return NextResponse.json({ success: true });
}
