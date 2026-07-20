"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Plus, Pencil, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useBitacoras } from "../../application/use-ficha";
import { BitacoraFormSheet } from "../atenciones/bitacora-form-sheet";

interface AtencionesTabProps {
  fichaId: number;
}

export function AtencionesTab({ fichaId }: AtencionesTabProps) {
  const { data, loading, refresh } = useBitacoras(fichaId);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | undefined>(undefined);
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});

  const sorted = [...data].sort(
    (a, b) => new Date(b.created ?? 0).getTime() - new Date(a.created ?? 0).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Atenciones ({data.length})
        </h2>
        <Button onClick={() => { setEditingId(undefined); setSheetOpen(true); }}>
          <Plus className="size-4" />
          Nueva Atención
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Spinner className="size-5" />
          <span>Cargando atenciones...</span>
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay atenciones registradas
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setSheetOpen(true)}>
              <Plus className="size-3" />
              Registrar primera atención
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
          {sorted.map((b) => {
            const isExpanded = expanded[b.id];
            return (
              <div key={b.id} className="relative mb-4 last:mb-0">
                <div className="absolute -left-[19px] top-3 size-3 rounded-full border-2 border-primary bg-background" />
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {b.motivo_consulta}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {b.created
                            ? format(new Date(b.created), "dd/MM/yyyy HH:mm")
                            : "Sin fecha"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingId(b.id); setSheetOpen(true); }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [b.id]: !prev[b.id],
                            }))
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isExpanded && (
                      <div className="space-y-3 text-sm">
                        {b.enfermedad_actual && (
                          <div>
                            <span className="font-medium">Enfermedad actual:</span>
                            <p className="text-muted-foreground">{b.enfermedad_actual}</p>
                          </div>
                        )}
                        {b.examen_fisico && (
                          <div>
                            <span className="font-medium">Examen físico:</span>
                            <p className="text-muted-foreground">{b.examen_fisico}</p>
                          </div>
                        )}
                        {b.anamnesis && (
                          <div>
                            <span className="font-medium">Anamnesis:</span>
                            <p className="text-muted-foreground">{b.anamnesis}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-3">
                          {b.presion_sistolica && (
                            <Badge variant="outline">
                              PA: {b.presion_sistolica}/{b.presion_diastolica ?? "?"} mmHg
                            </Badge>
                          )}
                          {b.pulso && (
                            <Badge variant="outline">Pulso: {b.pulso} lpm</Badge>
                          )}
                          {b.frecuencia_respiratoria && (
                            <Badge variant="outline">FR: {b.frecuencia_respiratoria} rpm</Badge>
                          )}
                          {b.temperatura && (
                            <Badge variant="outline">Temp: {b.temperatura} °C</Badge>
                          )}
                          {b.saturacion_o2 && (
                            <Badge variant="outline">SatO₂: {b.saturacion_o2}%</Badge>
                          )}
                          {b.glicemia && (
                            <Badge variant="outline">Glicemia: {b.glicemia} mg/dL</Badge>
                          )}
                          {b.peso && (
                            <Badge variant="outline">Peso: {b.peso} kg</Badge>
                          )}
                          {b.talla && (
                            <Badge variant="outline">Talla: {b.talla} cm</Badge>
                          )}
                          {b.imc && (
                            <Badge variant="outline">IMC: {b.imc}</Badge>
                          )}
                          {b.perimetro_abdominal && (
                            <Badge variant="outline">PA: {b.perimetro_abdominal} cm</Badge>
                          )}
                        </div>
                        {b.plan_terapeutico && (
                          <div>
                            <span className="font-medium">Plan terapéutico:</span>
                            <p className="text-muted-foreground">{b.plan_terapeutico}</p>
                          </div>
                        )}
                        {b.indicaciones && (
                          <div>
                            <span className="font-medium">Indicaciones:</span>
                            <p className="text-muted-foreground">{b.indicaciones}</p>
                          </div>
                        )}
                        {b.proximo_control_fecha && (
                          <div>
                            <span className="font-medium">Próximo control:</span>
                            <p className="text-muted-foreground">
                              {format(new Date(b.proximo_control_fecha), "dd/MM/yyyy")}
                              {b.proximo_control_motivo && ` - ${b.proximo_control_motivo}`}
                            </p>
                          </div>
                        )}

                        {b.diagnosticos && b.diagnosticos.length > 0 && (
                          <div>
                            <span className="font-medium">Diagnósticos:</span>
                            <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                              {b.diagnosticos.map((d) => (
                                <li key={d.id}>
                                  {d.codigo_cie10 && <span className="font-mono text-xs">{d.codigo_cie10} — </span>}
                                  {d.diagnostico}
                                  {d.principal && <Badge variant="secondary" className="ml-1 text-[10px]">Principal</Badge>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {b.recetas && b.recetas.length > 0 && (
                          <div>
                            <span className="font-medium">Recetas:</span>
                            <ul className="mt-1 space-y-2">
                              {b.recetas.map((r) => (
                                <li key={r.id}>
                                  <div className="text-muted-foreground">
                                    {r.detalle.map((d) => d.medicamento).join(", ")}
                                  </div>
                                  {r.observaciones && (
                                    <p className="text-xs text-muted-foreground">{r.observaciones}</p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <BitacoraFormSheet
        key={editingId ? `edit-${editingId}` : "new"}
        open={sheetOpen}
        onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditingId(undefined); }}
        fichaId={fichaId}
        bitacoraId={editingId}
        onSuccess={() => {
          setSheetOpen(false);
          setEditingId(undefined);
          void refresh();
        }}
      />
    </div>
  );
}
