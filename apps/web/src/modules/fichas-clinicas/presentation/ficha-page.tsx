"use client";

import { useRouter } from "next/navigation";

import { Activity, ArrowLeft, FileText, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFicha } from "../application/use-ficha";
import { AntecedentesTab } from "./tabs/antecedentes-tab";
import { ArchivosTab } from "./tabs/archivos-tab";
import { AtencionesTab } from "./tabs/atenciones-tab";
import { DatosGeneralesTab } from "./tabs/datos-generales-tab";

interface FichaPageProps {
  rut: string;
  nombrePaciente?: string;
}

export function FichaPage({ rut, nombrePaciente }: FichaPageProps) {
  const router = useRouter();
  const { ficha, loading, error } = useFicha(rut);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Spinner className="size-5" />
        <span className="text-sm">Cargando ficha clínica...</span>
      </div>
    );
  }

  if (error || !ficha) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "Ficha no encontrada"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-xl">Ficha Clínica</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-medium">{nombrePaciente || "Paciente"}</span>
            <span className="text-muted-foreground/40">|</span>
            <span className="font-mono">{rut}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="datos-generales">
        <TabsList>
          <TabsTrigger value="datos-generales">
            <FileText className="size-4" />
            Ficha
          </TabsTrigger>
          <TabsTrigger value="antecedentes">
            <Activity className="size-4" />
            Antecedentes
          </TabsTrigger>
          <TabsTrigger value="atenciones">
            <FileText className="size-4" />
            Atenciones
          </TabsTrigger>
          <TabsTrigger value="archivos">
            <FolderOpen className="size-4" />
            Archivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos-generales">
          <DatosGeneralesTab
            ficha={ficha}
            onUpdate={(_data) => {
              // ficha is refreshed via useFicha
            }}
          />
        </TabsContent>

        <TabsContent value="antecedentes">
          <AntecedentesTab fichaId={ficha.id} />
        </TabsContent>

        <TabsContent value="atenciones">
          <AtencionesTab fichaId={ficha.id} />
        </TabsContent>

        <TabsContent value="archivos">
          <ArchivosTab fichaId={ficha.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
