import { NextResponse } from "next/server";

import { prisma } from "@uapp/database";

import { getPresignedUrl, uploadToR2 } from "@/lib/r2";

const ALLOWED_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_SIZE = 25 * 1024 * 1024;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const files = await prisma.uapp_archivos_generales.findMany({
    where: { id_ficha: Number(id) },
    include: {
      uapp_document_subcategories: {
        include: { categoria: true },
      },
    },
    orderBy: { created: "desc" },
  });
  const data = await Promise.all(
    files.map(async (f) => ({
      id: f.id,
      id_ficha: f.id_ficha,
      nombre: f.nombre,
      categoria: f.categoria,
      id_subcategoria: f.id_subcategoria,
      tipo_mime: f.tipo_mime,
      tamaño: f.tamaño,
      ruta: f.ruta,
      observacion: f.observacion,
      usuario: f.usuario,
      created: f.created,
      subcategoria: f.uapp_document_subcategories
        ? {
            id: f.uapp_document_subcategories.id,
            nombre: f.uapp_document_subcategories.nombre,
            codigo: f.uapp_document_subcategories.codigo,
            categoria: {
              id: (f.uapp_document_subcategories as any).categoria?.id,
              nombre: (f.uapp_document_subcategories as any).categoria?.nombre,
              codigo: (f.uapp_document_subcategories as any).categoria?.codigo,
            },
          }
        : null,
      url_descarga: f.ruta ? await getPresignedUrl(f.ruta) : null,
    })),
  );
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const nombre = (formData.get("nombre") as string) || file?.name || "archivo";
  const categoria = formData.get("categoria") as string | null;
  const observacion = formData.get("observacion") as string | null;
  const idSubcategoria = formData.get("id_subcategoria") ? Number(formData.get("id_subcategoria")) : null;

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!ALLOWED_MIMES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Solo PDF, documentos Office e imágenes." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El archivo supera el límite de 25 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `fichas/${id}/${Date.now()}-${file.name}`;

  await uploadToR2(key, buffer, file.type);

  const data = await prisma.uapp_archivos_generales.create({
    data: {
      id_ficha: Number(id),
      nombre,
      categoria,
      id_subcategoria: idSubcategoria,
      tipo_mime: file.type,
      tamaño: file.size,
      ruta: key,
      observacion,
    },
  });

  return NextResponse.json({ data: { ...data, url_descarga: await getPresignedUrl(key) } }, { status: 201 });
}
