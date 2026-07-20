"use client";

import * as React from "react";

import type { CategoriaConSubcategorias, SubcategoriaDocumento } from "../domain/documento-categoria.entity";
import {
  actualizarCategoria,
  actualizarSubcategoria,
  crearCategoria,
  crearSubcategoria,
  eliminarCategoria,
  eliminarSubcategoria,
  fetchCategorias,
} from "../infrastructure/documentos-categorias.service";

export function useCategorias() {
  const [data, setData] = React.useState<CategoriaConSubcategorias[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchCategorias());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    refresh: load,
    crear: (d: Parameters<typeof crearCategoria>[0]) => crearCategoria(d).then(() => load()),
    actualizar: (id: number, d: Parameters<typeof actualizarCategoria>[1]) =>
      actualizarCategoria(id, d).then(() => load()),
    eliminar: (id: number) => eliminarCategoria(id).then(() => load()),
    crearSub: (idCat: number, d: Parameters<typeof crearSubcategoria>[1]) =>
      crearSubcategoria(idCat, d).then(() => load()),
    actualizarSub: (id: number, d: Parameters<typeof actualizarSubcategoria>[1]) =>
      actualizarSubcategoria(id, d).then(() => load()),
    eliminarSub: (id: number) => eliminarSubcategoria(id).then(() => load()),
  };
}

export function useCategoriasDropdown() {
  const [data, setData] = React.useState<CategoriaConSubcategorias[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categorias-documentos");
      if (res.ok) setData(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { data, loading };

  // Use this function to get subcategories for a given category
  function _getSubcategorias(categoriaId: number | null): SubcategoriaDocumento[] {
    if (!categoriaId) return [];
    const cat = data.find((c) => c.id === categoriaId);
    return cat?.subcategorias ?? [];
  }
}
