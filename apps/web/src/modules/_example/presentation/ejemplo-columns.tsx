// Columnas del ServerDataTable para el modulo Example
// Sigue el patron de commentColumns en server-data-table.tsx

import type { ColumnDef } from "@tanstack/react-table";

import type { ExampleEntity } from "../domain/example.entity";

export const ejemploColumns: ColumnDef<ExampleEntity>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.getValue<string>("id")}
      </span>
    ),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <span
        className="font-medium line-clamp-1"
        title={row.getValue<string>("nombre")}
      >
        {row.getValue("nombre")}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue<string>("email")}`}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        {row.getValue("email")}
      </a>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue<string>("estado");
      return (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            estado === "activo"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {estado}
        </span>
      );
    },
  },
];
