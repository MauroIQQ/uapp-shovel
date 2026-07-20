// Columnas del ServerDataTable para el modulo Example
// Sigue el patron de commentColumns en server-data-table.tsx

import type { ColumnDef } from "@tanstack/react-table";

import type { ExampleEntity } from "../domain/example.entity";

export const ejemploColumns: ColumnDef<ExampleEntity>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.getValue<string>("id")}</span>,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="line-clamp-1 font-medium" title={row.getValue<string>("nombre")}>
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
        className="text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground"
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
          className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${
            estado === "activo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {estado}
        </span>
      );
    },
  },
];
