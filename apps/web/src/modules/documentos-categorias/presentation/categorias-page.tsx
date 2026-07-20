"use client";

import * as React from "react";

import { ChevronDown, ChevronRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCategorias } from "../application/use-documentos-categorias";
import { CategoriaFormSheet } from "./categoria-form-sheet";
import { SubcategoriaFormDialog } from "./subcategoria-form-dialog";

export function CategoriasPage() {
  const { data, loading, refresh, crear, actualizar, eliminar, crearSub, actualizarSub, eliminarSub } = useCategorias();
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const [catSheetOpen, setCatSheetOpen] = React.useState(false);
  const [editingCat, setEditingCat] = React.useState<number | undefined>(undefined);
  const [subDialogOpen, setSubDialogOpen] = React.useState(false);
  const [editingSub, setEditingSub] = React.useState<{ id: number; idCat: number } | undefined>(undefined);
  const [subForCat, setSubForCat] = React.useState<number | undefined>(undefined);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categorías de Documentos</CardTitle>
            <Button
              onClick={() => {
                setEditingCat(undefined);
                setCatSheetOpen(true);
              }}
            >
              <Plus className="size-4" />
              Nueva Categoría
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Spinner className="size-5" />
              <span>Cargando categorías...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderTree className="mb-2 size-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No hay categorías registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Subcategorías</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((cat) => {
                  const isExpanded = expanded[cat.id];
                  return (
                    <React.Fragment key={cat.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                          >
                            {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{cat.codigo}</TableCell>
                        <TableCell className="font-medium">{cat.nombre}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{cat.descripcion ?? "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cat.subcategorias.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => {
                                setSubForCat(cat.id);
                                setEditingSub(undefined);
                                setSubDialogOpen(true);
                              }}
                            >
                              <Plus className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => {
                                setEditingCat(cat.id);
                                setCatSheetOpen(true);
                              }}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive"
                              onClick={() => {
                                if (confirm("¿Eliminar categoría?")) eliminar(cat.id);
                              }}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded &&
                        cat.subcategorias.map((sub) => (
                          <TableRow key={sub.id} className="bg-muted/20">
                            <TableCell />
                            <TableCell className="font-mono text-muted-foreground text-xs">{sub.codigo}</TableCell>
                            <TableCell>
                              <span className="text-muted-foreground text-sm">└── </span>
                              {sub.nombre}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{sub.descripcion ?? "-"}</TableCell>
                            <TableCell />
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => {
                                    setEditingSub({ id: sub.id, idCat: cat.id });
                                    setSubDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-destructive"
                                  onClick={() => {
                                    if (confirm("¿Eliminar subcategoría?")) eliminarSub(sub.id);
                                  }}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoriaFormSheet
        open={catSheetOpen}
        onOpenChange={setCatSheetOpen}
        categoriaId={editingCat}
        categorias={data}
        onSave={(d, id) => (id ? actualizar(id, d) : crear(d)).then(() => setCatSheetOpen(false))}
      />

      <SubcategoriaFormDialog
        open={subDialogOpen}
        onOpenChange={setSubDialogOpen}
        idCategoria={subForCat}
        editingSub={editingSub}
        onSave={(d, idCat, subId) =>
          subId
            ? actualizarSub(subId, d).then(() => setSubDialogOpen(false))
            : idCat
              ? crearSub(idCat, d).then(() => setSubDialogOpen(false))
              : Promise.resolve()
        }
      />
    </div>
  );
}
