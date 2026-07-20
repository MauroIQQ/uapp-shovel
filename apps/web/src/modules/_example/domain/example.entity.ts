// Entidad: representa un registro del dominio
// Solo tiene datos y validacion, sin dependencias de React o Next

export interface ExampleEntity {
  id: string;
  nombre: string;
  email: string;
  estado: "activo" | "inactivo";
  createdAt: Date;
}

// Valida que el nombre no este vacio
export function validateNombre(nombre: string): string | null {
  if (!nombre || nombre.trim().length === 0) return "El nombre es obligatorio";
  if (nombre.length > 100) return "El nombre es muy largo (max 100 caracteres)";
  return null;
}
