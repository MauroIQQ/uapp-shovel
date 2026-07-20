"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useAntePersonales,
  useAnteQuirurgicos,
  useAnteFamiliares,
  useAlergias,
  useMedicacionCronica,
  useProblemasActivos,
  useHabitos,
} from "../../application/use-ficha";

interface AntecedentesTabProps {
  fichaId: number;
}

// ─── Antecedentes Personales ───

function AntePersonalesSection({ fichaId }: { fichaId: number }) {
  const { data, loading, crear, eliminar } = useAntePersonales(fichaId);
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState("");

  async function handleAdd() {
    if (!tipo.trim()) return;
    await crear({ tipo: tipo.trim() });
    setTipo("");
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Antecedentes Personales</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="size-3" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Antecedente Personal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field className="gap-1.5">
                  <FieldLabel>Tipo</FieldLabel>
                  <Input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ej: Diabetes, Hipertensión" />
                </Field>
                <Button onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando antecedentes personales...</span>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin antecedentes registrados</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.map((a) => (
              <Badge key={a.id} variant="secondary" className="gap-1">
                {a.tipo}
                {a.observaciones && <span className="text-muted-foreground">({a.observaciones})</span>}
                <button onClick={() => eliminar(a.id)} className="ml-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Antecedentes Quirúrgicos ───

function AnteQuirurgicosSection({ fichaId }: { fichaId: number }) {
  const { data, loading, crear, eliminar } = useAnteQuirurgicos(fichaId);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ procedimiento: "", fecha: "", centro_medico: "", observaciones: "" });

  async function handleAdd() {
    if (!form.procedimiento.trim()) return;
    await crear({
      procedimiento: form.procedimiento.trim(),
      fecha: form.fecha || null,
      centro_medico: form.centro_medico || null,
      observaciones: form.observaciones || null,
    });
    setForm({ procedimiento: "", fecha: "", centro_medico: "", observaciones: "" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Antecedentes Quirúrgicos</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="size-3" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Antecedente Quirúrgico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field className="gap-1.5">
                  <FieldLabel>Procedimiento</FieldLabel>
                  <Input value={form.procedimiento} onChange={(e) => setForm((f) => ({ ...f, procedimiento: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Fecha</FieldLabel>
                  <Input type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Centro Médico</FieldLabel>
                  <Input value={form.centro_medico} onChange={(e) => setForm((f) => ({ ...f, centro_medico: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Observaciones</FieldLabel>
                  <Input value={form.observaciones} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))} />
                </Field>
                <Button onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando antecedentes quirúrgicos...</span>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin antecedentes quirúrgicos</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedimiento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Centro Médico</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.procedimiento}</TableCell>
                  <TableCell>{q.fecha ?? "-"}</TableCell>
                  <TableCell>{q.centro_medico ?? "-"}</TableCell>
                  <TableCell>
                    <button onClick={() => eliminar(q.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Antecedentes Familiares ───

function AnteFamiliaresSection({ fichaId }: { fichaId: number }) {
  const { data, loading, crear, eliminar } = useAnteFamiliares(fichaId);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ parentesco: "", enfermedad: "", edad_diagnostico: "" });

  async function handleAdd() {
    if (!form.parentesco.trim() || !form.enfermedad.trim()) return;
    await crear({
      parentesco: form.parentesco.trim(),
      enfermedad: form.enfermedad.trim(),
      edad_diagnostico: form.edad_diagnostico ? Number(form.edad_diagnostico) : null,
    });
    setForm({ parentesco: "", enfermedad: "", edad_diagnostico: "" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Antecedentes Familiares</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="size-3" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Antecedente Familiar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field className="gap-1.5">
                  <FieldLabel>Parentesco</FieldLabel>
                  <Input value={form.parentesco} onChange={(e) => setForm((f) => ({ ...f, parentesco: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Enfermedad</FieldLabel>
                  <Input value={form.enfermedad} onChange={(e) => setForm((f) => ({ ...f, enfermedad: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Edad Diagnóstico</FieldLabel>
                  <Input type="number" value={form.edad_diagnostico} onChange={(e) => setForm((f) => ({ ...f, edad_diagnostico: e.target.value }))} />
                </Field>
                <Button onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando antecedentes familiares...</span>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin antecedentes familiares</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parentesco</TableHead>
                <TableHead>Enfermedad</TableHead>
                <TableHead>Edad Diagnóstico</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.parentesco}</TableCell>
                  <TableCell>{f.enfermedad}</TableCell>
                  <TableCell>{f.edad_diagnostico ?? "-"}</TableCell>
                  <TableCell>
                    <button onClick={() => eliminar(f.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Alergias ───

function AlergiasSection({ fichaId }: { fichaId: number }) {
  const { data, loading, crear, eliminar } = useAlergias(fichaId);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ tipo: "", descripcion: "", severidad: "", reaccion: "" });

  async function handleAdd() {
    if (!form.tipo.trim() || !form.descripcion.trim()) return;
    await crear({
      tipo: form.tipo.trim(),
      descripcion: form.descripcion.trim(),
      severidad: form.severidad || null,
      reaccion: form.reaccion || null,
      activa: true,
    });
    setForm({ tipo: "", descripcion: "", severidad: "", reaccion: "" });
    setOpen(false);
  }

  const severityColor = (s: string | null) => {
    switch (s) {
      case "Leve": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Moderada": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Severa": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alergias</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="size-3" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Alergia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field className="gap-1.5">
                  <FieldLabel>Tipo</FieldLabel>
                  <Input value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} placeholder="Ej: Medicamentosa, Alimentaria" />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Descripción</FieldLabel>
                  <Input value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Severidad</FieldLabel>
                  <Select value={form.severidad} onValueChange={(v) => setForm((f) => ({ ...f, severidad: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leve">Leve</SelectItem>
                      <SelectItem value="Moderada">Moderada</SelectItem>
                      <SelectItem value="Severa">Severa</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Reacción</FieldLabel>
                  <Input value={form.reaccion} onChange={(e) => setForm((f) => ({ ...f, reaccion: e.target.value }))} />
                </Field>
                <Button onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando alergias...</span>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Reacción</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell>{a.descripcion}</TableCell>
                  <TableCell>
                    {a.severidad && (
                      <Badge className={severityColor(a.severidad)} variant="outline">
                        {a.severidad}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{a.reaccion ?? "-"}</TableCell>
                  <TableCell>
                    <button onClick={() => eliminar(a.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Medicación Crónica ───

function MedicacionSection({ fichaId }: { fichaId: number }) {
  const { data, loading, crear, eliminar } = useMedicacionCronica(fichaId);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ medicamento: "", dosis: "", frecuencia: "", via: "", indicacion: "" });

  async function handleAdd() {
    if (!form.medicamento.trim()) return;
    await crear({
      medicamento: form.medicamento.trim(),
      dosis: form.dosis || null,
      frecuencia: form.frecuencia || null,
      via: form.via || null,
      indicacion: form.indicacion || null,
      activo: true,
    });
    setForm({ medicamento: "", dosis: "", frecuencia: "", via: "", indicacion: "" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Medicación Crónica</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="size-3" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Medicación</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field className="gap-1.5">
                  <FieldLabel>Medicamento</FieldLabel>
                  <Input value={form.medicamento} onChange={(e) => setForm((f) => ({ ...f, medicamento: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Dosis</FieldLabel>
                  <Input value={form.dosis} onChange={(e) => setForm((f) => ({ ...f, dosis: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Frecuencia</FieldLabel>
                  <Input value={form.frecuencia} onChange={(e) => setForm((f) => ({ ...f, frecuencia: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Vía</FieldLabel>
                  <Input value={form.via} onChange={(e) => setForm((f) => ({ ...f, via: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Indicación</FieldLabel>
                  <Input value={form.indicacion} onChange={(e) => setForm((f) => ({ ...f, indicacion: e.target.value }))} />
                </Field>
                <Button onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando medicación crónica...</span>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin medicación crónica</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Dosis</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Vía</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.medicamento}</TableCell>
                  <TableCell>{m.dosis ?? "-"}</TableCell>
                  <TableCell>{m.frecuencia ?? "-"}</TableCell>
                  <TableCell>{m.via ?? "-"}</TableCell>
                  <TableCell>
                    <button onClick={() => eliminar(m.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Problemas Activos ───

function ProblemasActivosSection({ fichaId }: { fichaId: number }) {
  const { data, loading, crear, eliminar } = useProblemasActivos(fichaId);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ diagnostico: "", codigo_cie10: "", estado: "", observaciones: "" });

  async function handleAdd() {
    if (!form.diagnostico.trim()) return;
    await crear({
      diagnostico: form.diagnostico.trim(),
      codigo_cie10: form.codigo_cie10 || null,
      estado: form.estado || null,
      observaciones: form.observaciones || null,
    });
    setForm({ diagnostico: "", codigo_cie10: "", estado: "", observaciones: "" });
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Problemas Activos</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="size-3" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Problema Activo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Field className="gap-1.5">
                  <FieldLabel>Diagnóstico</FieldLabel>
                  <Input value={form.diagnostico} onChange={(e) => setForm((f) => ({ ...f, diagnostico: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Código CIE-10</FieldLabel>
                  <Input value={form.codigo_cie10} onChange={(e) => setForm((f) => ({ ...f, codigo_cie10: e.target.value }))} />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Estado</FieldLabel>
                  <Select value={form.estado} onValueChange={(v) => setForm((f) => ({ ...f, estado: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="En estudio">En estudio</SelectItem>
                      <SelectItem value="Controlado">Controlado</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel>Observaciones</FieldLabel>
                  <Input value={form.observaciones} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))} />
                </Field>
                <Button onClick={handleAdd}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Cargando problemas activos...</span>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin problemas activos</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>CIE-10</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.diagnostico}</TableCell>
                  <TableCell>{p.codigo_cie10 ?? "-"}</TableCell>
                  <TableCell>
                    {p.estado && <Badge variant="secondary">{p.estado}</Badge>}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => eliminar(p.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Hábitos ───

function HabitosSection({ fichaId }: { fichaId: number }) {
  const { data, loading, actualizar } = useHabitos(fichaId);

  const h = data ?? {
    tabaquismo: null,
    cantidad_diaria: null,
    alcohol: null,
    frecuencia_alcohol: null,
    drogas: null,
    actividad_fisica: null,
    horas_sueno: null,
    alimentacion: null,
  };

  function handleChange(field: string, value: unknown) {
    actualizar({ [field]: value });
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
      <Spinner className="size-4" />
      <span>Cargando hábitos...</span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hábitos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="tabaquismo"
              checked={h.tabaquismo ?? false}
              onCheckedChange={(c) => handleChange("tabaquismo", c)}
            />
            <label htmlFor="tabaquismo" className="text-sm cursor-pointer">Tabaquismo</label>
          </div>
          {h.tabaquismo && (
            <Field className="gap-1.5">
              <FieldLabel>Cantidad diaria</FieldLabel>
              <Input
                type="number"
                value={h.cantidad_diaria ?? ""}
                onChange={(e) => handleChange("cantidad_diaria", e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="alcohol"
              checked={h.alcohol ?? false}
              onCheckedChange={(c) => handleChange("alcohol", c)}
            />
            <label htmlFor="alcohol" className="text-sm cursor-pointer">Alcohol</label>
          </div>
          {h.alcohol && (
            <Field className="gap-1.5">
              <FieldLabel>Frecuencia</FieldLabel>
              <Input
                value={h.frecuencia_alcohol ?? ""}
                onChange={(e) => handleChange("frecuencia_alcohol", e.target.value || null)}
                placeholder="Ej: Ocasional, Semanal"
              />
            </Field>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="drogas"
              checked={h.drogas ?? false}
              onCheckedChange={(c) => handleChange("drogas", c)}
            />
            <label htmlFor="drogas" className="text-sm cursor-pointer">Drogas</label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="actividad_fisica"
              checked={h.actividad_fisica ?? false}
              onCheckedChange={(c) => handleChange("actividad_fisica", c)}
            />
            <label htmlFor="actividad_fisica" className="text-sm cursor-pointer">Actividad Física</label>
          </div>

          <Field className="gap-1.5">
            <FieldLabel>Horas de Sueño</FieldLabel>
            <Input
              type="number"
              value={h.horas_sueno ?? ""}
              onChange={(e) => handleChange("horas_sueno", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel>Alimentación</FieldLabel>
            <Input
              value={h.alimentacion ?? ""}
              onChange={(e) => handleChange("alimentacion", e.target.value || null)}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───

export function AntecedentesTab({ fichaId }: AntecedentesTabProps) {
  return (
    <div className="space-y-4">
      <AntePersonalesSection fichaId={fichaId} />
      <AnteQuirurgicosSection fichaId={fichaId} />
      <AnteFamiliaresSection fichaId={fichaId} />
      <AlergiasSection fichaId={fichaId} />
      <MedicacionSection fichaId={fichaId} />
      <ProblemasActivosSection fichaId={fichaId} />
      <HabitosSection fichaId={fichaId} />
    </div>
  );
}
