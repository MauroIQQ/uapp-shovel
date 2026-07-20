import { prisma } from "@uapp/database";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.uapp_adjuntos.findMany({
    where: { id_bitacora: Number(id) },
    orderBy: { created: "desc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const nombre = (formData.get("nombre") as string) || file?.name || "archivo";
  const categoria = formData.get("categoria") as string | null;
  const comentario = formData.get("comentario") as string | null;

  let ruta = "";
  if (file) {
    const R2_ACCOUNT_ID = "66b58aa5c796e01b261f940a5f5e94be";
    const R2_ACCESS_KEY_ID = "5df3fccd5df2ef12b974da41ba00a736";
    const R2_SECRET_ACCESS_KEY = "154a2c5e856cb6fc266a89fc7abb978261c07eb6e52c43e9fc0081abd653f637";
    const R2_BUCKET_NAME = "renacimiento-shovel";
    const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const key = `bitacoras/${id}/${Date.now()}-${file.name}`;

    const res = await fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
      method: "PUT",
      headers: {
        Authorization: `AWS ${R2_ACCESS_KEY_ID}:${R2_SECRET_ACCESS_KEY}`,
        "Content-Type": file.type,
      },
      body: fileBuffer,
    });
    if (!res.ok) {
      console.error("R2 upload failed", await res.text());
      return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
    }
    ruta = key;
  }

  const data = await prisma.uapp_adjuntos.create({
    data: {
      id_bitacora: Number(id),
      nombre,
      categoria,
      tipo_mime: file?.type ?? null,
      tamaño: file?.size ?? null,
      ruta,
      comentario,
    },
  });
  return NextResponse.json({ data }, { status: 201 });
}
