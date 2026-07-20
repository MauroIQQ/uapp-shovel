import { apiFetch } from "@/lib/api-fetch";

import type {
  Adjunto,
  Alergia,
  AnteFamiliar,
  AntePersonal,
  AnteQuirurgico,
  ArchivoGeneral,
  Bitacora,
  Diagnostico,
  DocumentoEmitido,
  FichaClinica,
  Habitos,
  MedicacionCronica,
  OrdenMedica,
  ProblemaActivo,
  Procedimiento,
  Receta,
  RecetaDetalle,
} from "../domain/ficha.entity";
import type {
  ActualizarAlergiaData,
  ActualizarAnteFamiliarData,
  ActualizarAnteQuirurgicoData,
  ActualizarBitacoraData,
  ActualizarDiagnosticoData,
  ActualizarFichaData,
  ActualizarHabitosData,
  ActualizarMedicacionData,
  ActualizarProblemaActivoData,
  CrearAlergiaData,
  CrearAnteFamiliarData,
  CrearAntePersonalData,
  CrearAnteQuirurgicoData,
  CrearBitacoraData,
  CrearDiagnosticoData,
  CrearMedicacionData,
  CrearOrdenMedicaData,
  CrearProblemaActivoData,
  CrearProcedimientoData,
  CrearRecetaData,
} from "../domain/ficha.schema";

const BASE = "/api/fichas";

// ─── Ficha ───
export async function fetchFichaPorRut(rut: string): Promise<FichaClinica | null> {
  const res = await apiFetch(`${BASE}?rut=${rut}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function crearFicha(rut: string): Promise<FichaClinica> {
  const res = await apiFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rut_paciente: rut }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarFicha(id: number, dto: ActualizarFichaData): Promise<FichaClinica> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

// ─── Antecedentes Personales ───
export async function fetchAntePersonales(fichaId: number): Promise<AntePersonal[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/ante-personales`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearAntePersonal(fichaId: number, dto: CrearAntePersonalData): Promise<AntePersonal> {
  const res = await apiFetch(`${BASE}/${fichaId}/ante-personales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarAntePersonal(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/ante-personales/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Antecedentes Quirúrgicos ───
export async function fetchAnteQuirurgicos(fichaId: number): Promise<AnteQuirurgico[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/quirurgicos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearAnteQuirurgico(fichaId: number, dto: CrearAnteQuirurgicoData): Promise<AnteQuirurgico> {
  const res = await apiFetch(`${BASE}/${fichaId}/quirurgicos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarAnteQuirurgico(id: number, dto: ActualizarAnteQuirurgicoData): Promise<AnteQuirurgico> {
  const res = await apiFetch(`${BASE}/quirurgicos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarAnteQuirurgico(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/quirurgicos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Antecedentes Familiares ───
export async function fetchAnteFamiliares(fichaId: number): Promise<AnteFamiliar[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/familiares`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearAnteFamiliar(fichaId: number, dto: CrearAnteFamiliarData): Promise<AnteFamiliar> {
  const res = await apiFetch(`${BASE}/${fichaId}/familiares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarAnteFamiliar(id: number, dto: ActualizarAnteFamiliarData): Promise<AnteFamiliar> {
  const res = await apiFetch(`${BASE}/familiares/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarAnteFamiliar(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/familiares/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Alergias ───
export async function fetchAlergias(fichaId: number): Promise<Alergia[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/alergias`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearAlergia(fichaId: number, dto: CrearAlergiaData): Promise<Alergia> {
  const res = await apiFetch(`${BASE}/${fichaId}/alergias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarAlergia(id: number, dto: ActualizarAlergiaData): Promise<Alergia> {
  const res = await apiFetch(`${BASE}/alergias/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarAlergia(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/alergias/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Medicación Crónica ───
export async function fetchMedicacionCronica(fichaId: number): Promise<MedicacionCronica[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/medicacion-cronica`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearMedicacionCronica(fichaId: number, dto: CrearMedicacionData): Promise<MedicacionCronica> {
  const res = await apiFetch(`${BASE}/${fichaId}/medicacion-cronica`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarMedicacionCronica(
  id: number,
  dto: ActualizarMedicacionData,
): Promise<MedicacionCronica> {
  const res = await apiFetch(`${BASE}/medicacion-cronica/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarMedicacionCronica(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/medicacion-cronica/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Problemas Activos ───
export async function fetchProblemasActivos(fichaId: number): Promise<ProblemaActivo[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/problemas-activos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearProblemaActivo(fichaId: number, dto: CrearProblemaActivoData): Promise<ProblemaActivo> {
  const res = await apiFetch(`${BASE}/${fichaId}/problemas-activos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarProblemaActivo(id: number, dto: ActualizarProblemaActivoData): Promise<ProblemaActivo> {
  const res = await apiFetch(`${BASE}/problemas-activos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarProblemaActivo(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/problemas-activos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Hábitos ───
export async function fetchHabitos(fichaId: number): Promise<Habitos | null> {
  const res = await apiFetch(`${BASE}/${fichaId}/habitos`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return (await res.json()).data;
}

export async function actualizarHabitos(fichaId: number, dto: ActualizarHabitosData): Promise<Habitos> {
  const res = await apiFetch(`${BASE}/${fichaId}/habitos`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

// ─── Archivos Generales ───
export async function fetchArchivosGenerales(fichaId: number): Promise<ArchivoGeneral[]> {
  const res = await apiFetch(`${BASE}/${fichaId}/archivos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearArchivoGeneral(fichaId: number, formData: FormData): Promise<ArchivoGeneral> {
  const res = await apiFetch(`${BASE}/${fichaId}/archivos`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarArchivoGeneral(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/archivos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Bitácoras ───
const BITACORAS = "/api/bitacoras";

export async function fetchBitacoras(fichaId: number): Promise<Bitacora[]> {
  const res = await apiFetch(`${BITACORAS}?ficha_id=${fichaId}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function fetchBitacora(id: number): Promise<Bitacora> {
  const res = await apiFetch(`${BITACORAS}/${id}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function fetchBitacoraCompleta(id: number): Promise<Bitacora> {
  const [bitacora, diagnosticos, recetas] = await Promise.all([
    fetchBitacora(id),
    fetchDiagnosticos(id),
    fetchRecetas(id),
  ]);
  return { ...bitacora, diagnosticos, recetas };
}

export async function crearBitacora(fichaId: number, dto: CrearBitacoraData): Promise<Bitacora> {
  const res = await apiFetch(BITACORAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...dto, id_ficha_clinica: fichaId }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarBitacora(id: number, dto: ActualizarBitacoraData): Promise<Bitacora> {
  const res = await apiFetch(`${BITACORAS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

// ─── Diagnósticos ───
export async function fetchDiagnosticos(bitacoraId: number): Promise<Diagnostico[]> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/diagnosticos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearDiagnostico(bitacoraId: number, dto: CrearDiagnosticoData): Promise<Diagnostico> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/diagnosticos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function actualizarDiagnostico(id: number, dto: ActualizarDiagnosticoData): Promise<Diagnostico> {
  const res = await apiFetch(`${BITACORAS}/diagnosticos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarDiagnostico(id: number): Promise<void> {
  const res = await apiFetch(`${BITACORAS}/diagnosticos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Recetas ───
export async function fetchRecetas(bitacoraId: number): Promise<Receta[]> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/recetas`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const raw = (await res.json()).data as (Receta & { uapp_recetas_detalle?: RecetaDetalle[] })[];
  return raw.map((r) => ({
    ...r,
    detalle: r.uapp_recetas_detalle ?? r.detalle ?? [],
  }));
}

export async function crearReceta(bitacoraId: number, dto: CrearRecetaData): Promise<Receta> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/recetas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarReceta(id: number): Promise<void> {
  const res = await apiFetch(`${BITACORAS}/recetas/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Órdenes Médicas ───
export async function fetchOrdenesMedicas(bitacoraId: number): Promise<OrdenMedica[]> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/ordenes`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearOrdenMedica(bitacoraId: number, dto: CrearOrdenMedicaData): Promise<OrdenMedica> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/ordenes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarOrdenMedica(id: number): Promise<void> {
  const res = await apiFetch(`${BITACORAS}/ordenes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Procedimientos ───
export async function fetchProcedimientos(bitacoraId: number): Promise<Procedimiento[]> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/procedimientos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearProcedimiento(bitacoraId: number, dto: CrearProcedimientoData): Promise<Procedimiento> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/procedimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarProcedimiento(id: number): Promise<void> {
  const res = await apiFetch(`${BITACORAS}/procedimientos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}

// ─── Documentos Emitidos ───
export async function fetchDocumentosEmitidos(bitacoraId: number): Promise<DocumentoEmitido[]> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/documentos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

// ─── Adjuntos ───
export async function fetchAdjuntos(bitacoraId: number): Promise<Adjunto[]> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/adjuntos`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function crearAdjunto(bitacoraId: number, formData: FormData): Promise<Adjunto> {
  const res = await apiFetch(`${BITACORAS}/${bitacoraId}/adjuntos`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return (await res.json()).data;
}

export async function eliminarAdjunto(id: number): Promise<void> {
  const res = await apiFetch(`${BITACORAS}/adjuntos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
}
