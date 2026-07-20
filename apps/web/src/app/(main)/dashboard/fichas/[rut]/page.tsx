import { FichaPage } from "@/modules/fichas-clinicas/presentation/ficha-page";

interface PageProps {
  params: Promise<{ rut: string }>;
  searchParams: Promise<{ nombre?: string }>;
}

export default async function FichaRoute({ params, searchParams }: PageProps) {
  const { rut } = await params;
  const { nombre } = await searchParams;
  return <FichaPage rut={rut} nombrePaciente={nombre ?? ""} />;
}
