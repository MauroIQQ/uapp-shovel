export interface Medicamento {
  id: number;
  id_categoria: number;
  nombre: string;
  rut_empresa: string;
  categoria_nombre: string;
  created: string | null;
  updated: string | null;
}

export interface CategoriaMedicamento {
  id: number;
  nombre: string;
  rut_empresa: string;
  created: string | null;
  updated: string | null;
}
