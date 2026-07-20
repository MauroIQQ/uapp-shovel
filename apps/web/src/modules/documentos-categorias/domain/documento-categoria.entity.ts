export interface CategoriaDocumento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  created: string;
  updated: string;
}

export interface SubcategoriaDocumento {
  id: number;
  id_categoria: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  created: string;
  updated: string;
}

export interface CategoriaConSubcategorias extends CategoriaDocumento {
  subcategorias: SubcategoriaDocumento[];
}
