"use client";

import * as React from "react";

import { CheckCircle2, Clock, FileIcon, FolderTree, Trash2, Upload, XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { ArchivoGeneral } from "../../domain/ficha.entity";
import { eliminarArchivoGeneral, fetchArchivosGenerales } from "../../infrastructure/fichas.service";
import { VerificarClaveDialog } from "../atenciones/verificar-clave-dialog";

interface ArchivosTabProps {
  fichaId: number;
}

interface CategoriaDropdown {
  id: number;
  nombre: string;
  codigo: string;
  subcategorias: { id: number; nombre: string; codigo: string }[];
}

interface UploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

function uploadFileXhr(
  item: UploadItem,
  fichaId: number,
  idSubcategoria: string,
  onProgress: (id: string, pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("id_subcategoria", idSubcategoria);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(item.id, Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        try {
          const json = JSON.parse(xhr.responseText);
          reject(new Error(json.error || xhr.statusText));
        } catch {
          reject(new Error(xhr.statusText));
        }
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Error de conexión")));
    xhr.open("POST", `/api/fichas/${fichaId}/archivos`);
    xhr.send(formData);
  });
}

export function ArchivosTab({ fichaId }: ArchivosTabProps) {
  const [files, setFiles] = React.useState<ArchivoGeneral[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [categorias, setCategorias] = React.useState<CategoriaDropdown[]>([]);
  const [catId, setCatId] = React.useState<string>("");
  const [subcatId, setSubcatId] = React.useState<string>("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploadQueue, setUploadQueue] = React.useState<UploadItem[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteArchivo, setDeleteArchivo] = React.useState<ArchivoGeneral | null>(null);
  const [verificarOpen, setVerificarOpen] = React.useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = React.useState<ArchivoGeneral | null>(null);

  const subcategorias = categorias.find((c) => c.id === Number(catId))?.subcategorias ?? [];

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([
        fetchArchivosGenerales(fichaId),
        fetch("/api/categorias-documentos").then((r) => (r.ok ? r.json() : { data: [] })),
      ]);
      setFiles(data);
      setCategorias(cats.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [fichaId]);

  React.useEffect(() => {
    if (fichaId) load();
  }, [fichaId, load]);

  React.useEffect(() => {
    setSubcatId("");
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...selected]);
    const newItems: UploadItem[] = selected.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: f.size > 25 * 1024 * 1024 ? ("error" as const) : ("pending" as const),
      progress: 0,
      error: f.size > 25 * 1024 * 1024 ? "El archivo supera el límite de 25 MB" : undefined,
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFromQueue(id: string) {
    setUploadQueue((prev) => prev.filter((u) => u.id !== id));
    setSelectedFiles((prev) => {
      const item = uploadQueue.find((u) => u.id === id);
      return item ? prev.filter((f) => f !== item.file) : prev;
    });
  }

  function clearCompleted() {
    setUploadQueue((prev) => prev.filter((u) => u.status === "pending" || u.status === "uploading"));
    setSelectedFiles([]);
  }

  async function handleUpload() {
    if (uploadQueue.length === 0 || !catId || !subcatId) {
      setError("Debes seleccionar archivos, categoría y subcategoría");
      return;
    }

    setError(null);
    setUploading(true);

    const pending = uploadQueue.filter((u) => u.status === "pending");
    setUploadQueue((prev) => prev.map((u) => (u.status === "pending" ? { ...u, status: "uploading" } : u)));

    for (const item of pending) {
      if (item.file.size > 25 * 1024 * 1024) {
        setUploadQueue((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, status: "error", error: "El archivo supera el límite de 25 MB" } : u,
          ),
        );
        continue;
      }

      try {
        await uploadFileXhr(item, fichaId, subcatId, (id, pct) => {
          setUploadQueue((prev) => prev.map((u) => (u.id === id ? { ...u, progress: pct } : u)));
        });
        setUploadQueue((prev) => prev.map((u) => (u.id === item.id ? { ...u, status: "done", progress: 100 } : u)));
      } catch (err) {
        setUploadQueue((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, status: "error", error: err instanceof Error ? err.message : "Error" } : u,
          ),
        );
      }
    }

    setSelectedFiles([]);
    setUploading(false);
    await load();
  }

  async function handleDeleteConfirm() {
    if (!deleteArchivo) return;
    const creado = new Date(deleteArchivo.created);
    const hoy = new Date();
    const esMismoDia =
      creado.getFullYear() === hoy.getFullYear() &&
      creado.getMonth() === hoy.getMonth() &&
      creado.getDate() === hoy.getDate();

    if (esMismoDia) {
      try {
        await eliminarArchivoGeneral(deleteArchivo.id);
        setFiles((prev) => prev.filter((x) => x.id !== deleteArchivo.id));
        setDeleteArchivo(null);
      } catch {
        // silent
      }
    } else {
      setArchivoAEliminar(deleteArchivo);
      setDeleteArchivo(null);
      setVerificarOpen(true);
    }
  }

  async function handleDeleteConfirmado() {
    if (!archivoAEliminar) return;
    try {
      await eliminarArchivoGeneral(archivoAEliminar.id);
      setFiles((prev) => prev.filter((x) => x.id !== archivoAEliminar.id));
    } catch {
      // silent
    } finally {
      setArchivoAEliminar(null);
    }
  }

  function formatSize(bytes: number | null): string {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const statusCounts = {
    total: uploadQueue.length,
    pending: uploadQueue.filter((u) => u.status === "pending").length,
    uploading: uploadQueue.filter((u) => u.status === "uploading").length,
    done: uploadQueue.filter((u) => u.status === "done").length,
    error: uploadQueue.filter((u) => u.status === "error").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subir Archivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileSelect}
                disabled={uploading}
                className="flex-1"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="rounded-md border bg-muted/20 p-2 text-muted-foreground text-sm">
                {selectedFiles.length} archivo{selectedFiles.length !== 1 ? "s" : ""} seleccionado
                {selectedFiles.length !== 1 ? "s" : ""}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={catId} onValueChange={setCatId} disabled={uploading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        <span className="flex items-center gap-2">
                          <FolderTree className="size-3" />
                          {c.nombre}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategoría *</Label>
                <Select value={subcatId} onValueChange={setSubcatId} disabled={uploading || !catId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={catId ? "Seleccionar subcategoría" : "Primero elige categoría"} />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {subcategorias.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {selectedFiles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFiles([]);
                    setUploadQueue([]);
                  }}
                >
                  Limpiar
                </Button>
              )}
              <Button onClick={handleUpload} disabled={uploading || uploadQueue.length === 0 || !catId || !subcatId}>
                <Upload className="size-4" />
                {uploading ? "Subiendo..." : "Subir archivos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monitor de Subida ({uploadQueue.length})</CardTitle>
              {statusCounts.done > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  Limpiar completados
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {uploadQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Upload className="mb-2 size-8 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Selecciona archivos para subir</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadQueue.map((item) => (
                  <div key={item.id} className="rounded-md border p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {item.status === "pending" && <Clock className="size-3.5 shrink-0 text-muted-foreground" />}
                        {item.status === "uploading" && <Spinner className="size-3.5 shrink-0" />}
                        {item.status === "done" && <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />}
                        {item.status === "error" && <XCircle className="size-3.5 shrink-0 text-destructive" />}
                        <span className="truncate font-medium text-sm">{item.file.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-muted-foreground text-xs">{formatSize(item.file.size)}</span>
                        {item.status === "pending" && (
                          <button
                            onClick={() => removeFromQueue(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <XCircle className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === "error" ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        {item.status === "pending" && "Pendiente"}
                        {item.status === "uploading" && `Subiendo... ${item.progress}%`}
                        {item.status === "done" && "Completado"}
                        {item.status === "error" && "Error"}
                      </span>
                      <span>{item.progress}%</span>
                    </div>
                    {item.error && <p className="mt-1 text-destructive text-xs">{item.error}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archivos ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Spinner className="size-5" />
              <span>Cargando archivos...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileIcon className="mb-2 size-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">No hay archivos subidos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      <a
                        href={f.url_descarga ?? f.ruta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                        {f.nombre}
                      </a>
                    </TableCell>
                    <TableCell>
                      {f.subcategoria ? (
                        <Badge variant="secondary" className="text-xs">
                          {f.subcategoria.categoria.nombre} → {f.subcategoria.nombre}
                        </Badge>
                      ) : f.categoria ? (
                        <Badge variant="secondary" className="text-xs">
                          {f.categoria}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatSize(f.tamaño)}</TableCell>
                    <TableCell className="text-muted-foreground">{f.usuario ?? "-"}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setDeleteArchivo(f)}
                        className="text-muted-foreground hover:text-destructive"
                      >
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

      <AlertDialog open={!!deleteArchivo} onOpenChange={(o) => !o && setDeleteArchivo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará <strong>{deleteArchivo?.nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VerificarClaveDialog
        open={verificarOpen}
        onOpenChange={(open) => {
          setVerificarOpen(open);
          if (!open) setArchivoAEliminar(null);
        }}
        onVerified={handleDeleteConfirmado}
      />
    </div>
  );
}
