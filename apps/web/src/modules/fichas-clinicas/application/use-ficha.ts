"use client";

import * as React from "react";

import type {
  Alergia,
  AnteFamiliar,
  AntePersonal,
  AnteQuirurgico,
  Bitacora,
  FichaClinica,
  Habitos,
  MedicacionCronica,
  ProblemaActivo,
} from "../domain/ficha.entity";
import {
  actualizarAlergia,
  actualizarAnteFamiliar,
  actualizarAnteQuirurgico,
  actualizarBitacora,
  actualizarFicha,
  actualizarHabitos,
  actualizarMedicacionCronica,
  actualizarProblemaActivo,
  crearAlergia,
  crearAnteFamiliar,
  crearAntePersonal,
  crearAnteQuirurgico,
  crearBitacora,
  crearFicha,
  crearMedicacionCronica,
  crearProblemaActivo,
  eliminarAlergia,
  eliminarAnteFamiliar,
  eliminarAntePersonal,
  eliminarAnteQuirurgico,
  eliminarMedicacionCronica,
  eliminarProblemaActivo,
  fetchAlergias,
  fetchAnteFamiliares,
  fetchAntePersonales,
  fetchAnteQuirurgicos,
  fetchBitacoras,
  fetchFichaPorRut,
  fetchHabitos,
  fetchMedicacionCronica,
  fetchProblemasActivos,
} from "../infrastructure/fichas.service";

export function useFicha(rut: string | undefined) {
  const [ficha, setFicha] = React.useState<FichaClinica | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    if (!rut) return;
    setLoading(true);
    setError(null);
    try {
      let data = await fetchFichaPorRut(rut);
      if (!data) {
        data = await crearFicha(rut);
      }
      setFicha(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar ficha");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [load]);

  async function update(data: Parameters<typeof actualizarFicha>[1]) {
    if (!ficha) return;
    const updated = await actualizarFicha(ficha.id, data);
    setFicha(updated);
  }

  return { ficha, loading, error, refresh: load, update };
}

function useList<T>(fetcher: (id: number) => Promise<T[]>) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function load(fichaId: number | undefined) {
    if (!fichaId) return;
    setLoading(true);
    try {
      setData(await fetcher(fichaId));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, setData, load };
}

export function useAntePersonales(fichaId: number | undefined) {
  const { data, loading, load } = useList<AntePersonal>(fetchAntePersonales);
  React.useEffect(() => {
    load(fichaId);
  }, [fichaId, load]);
  return {
    data,
    loading,
    crear: (d: Parameters<typeof crearAntePersonal>[1]) => crearAntePersonal(fichaId!, d).then(() => load(fichaId!)),
    eliminar: (id: number) => eliminarAntePersonal(id).then(() => load(fichaId!)),
  };
}

export function useAnteQuirurgicos(fichaId: number | undefined) {
  const { data, loading, load } = useList<AnteQuirurgico>(fetchAnteQuirurgicos);
  React.useEffect(() => {
    load(fichaId);
  }, [fichaId, load]);
  return {
    data,
    loading,
    crear: (d: Parameters<typeof crearAnteQuirurgico>[1]) =>
      crearAnteQuirurgico(fichaId!, d).then(() => load(fichaId!)),
    actualizar: (id: number, d: Parameters<typeof actualizarAnteQuirurgico>[1]) =>
      actualizarAnteQuirurgico(id, d).then(() => load(fichaId!)),
    eliminar: (id: number) => eliminarAnteQuirurgico(id).then(() => load(fichaId!)),
  };
}

export function useAnteFamiliares(fichaId: number | undefined) {
  const { data, loading, load } = useList<AnteFamiliar>(fetchAnteFamiliares);
  React.useEffect(() => {
    load(fichaId);
  }, [fichaId, load]);
  return {
    data,
    loading,
    crear: (d: Parameters<typeof crearAnteFamiliar>[1]) => crearAnteFamiliar(fichaId!, d).then(() => load(fichaId!)),
    actualizar: (id: number, d: Parameters<typeof actualizarAnteFamiliar>[1]) =>
      actualizarAnteFamiliar(id, d).then(() => load(fichaId!)),
    eliminar: (id: number) => eliminarAnteFamiliar(id).then(() => load(fichaId!)),
  };
}

export function useAlergias(fichaId: number | undefined) {
  const { data, loading, load } = useList<Alergia>(fetchAlergias);
  React.useEffect(() => {
    load(fichaId);
  }, [fichaId, load]);
  return {
    data,
    loading,
    crear: (d: Parameters<typeof crearAlergia>[1]) => crearAlergia(fichaId!, d).then(() => load(fichaId!)),
    actualizar: (id: number, d: Parameters<typeof actualizarAlergia>[1]) =>
      actualizarAlergia(id, d).then(() => load(fichaId!)),
    eliminar: (id: number) => eliminarAlergia(id).then(() => load(fichaId!)),
  };
}

export function useMedicacionCronica(fichaId: number | undefined) {
  const { data, loading, load } = useList<MedicacionCronica>(fetchMedicacionCronica);
  React.useEffect(() => {
    load(fichaId);
  }, [fichaId, load]);
  return {
    data,
    loading,
    crear: (d: Parameters<typeof crearMedicacionCronica>[1]) =>
      crearMedicacionCronica(fichaId!, d).then(() => load(fichaId!)),
    actualizar: (id: number, d: Parameters<typeof actualizarMedicacionCronica>[1]) =>
      actualizarMedicacionCronica(id, d).then(() => load(fichaId!)),
    eliminar: (id: number) => eliminarMedicacionCronica(id).then(() => load(fichaId!)),
  };
}

export function useProblemasActivos(fichaId: number | undefined) {
  const { data, loading, load } = useList<ProblemaActivo>(fetchProblemasActivos);
  React.useEffect(() => {
    load(fichaId);
  }, [fichaId, load]);
  return {
    data,
    loading,
    crear: (d: Parameters<typeof crearProblemaActivo>[1]) =>
      crearProblemaActivo(fichaId!, d).then(() => load(fichaId!)),
    actualizar: (id: number, d: Parameters<typeof actualizarProblemaActivo>[1]) =>
      actualizarProblemaActivo(id, d).then(() => load(fichaId!)),
    eliminar: (id: number) => eliminarProblemaActivo(id).then(() => load(fichaId!)),
  };
}

export function useHabitos(fichaId: number | undefined) {
  const [data, setData] = React.useState<Habitos | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    if (!fichaId) return;
    setLoading(true);
    try {
      setData(await fetchHabitos(fichaId));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [load]);
  return {
    data,
    loading,
    actualizar: (d: Parameters<typeof actualizarHabitos>[1]) =>
      actualizarHabitos(fichaId!, d).then((r) => {
        setData(r);
        return r;
      }),
  };
}

export function useBitacoras(fichaId: number | undefined) {
  const [data, setData] = React.useState<Bitacora[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    if (!fichaId) return;
    setLoading(true);
    try {
      setData(await fetchBitacoras(fichaId));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [load]);
  return {
    data,
    loading,
    refresh: load,
    crear: (d: Parameters<typeof crearBitacora>[1]) => crearBitacora(fichaId!, d).then(() => load()),
    actualizar: (id: number, d: Parameters<typeof actualizarBitacora>[1]) =>
      actualizarBitacora(id, d).then(() => load()),
  };
}
