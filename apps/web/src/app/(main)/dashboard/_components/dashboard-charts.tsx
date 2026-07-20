"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  atenciones: {
    label: "Atenciones",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

interface RawRow {
  fecha: string;
  atenciones: number;
  confirmada: string | null;
  atendido: string | null;
}

interface DashboardChartsProps {
  data: RawRow[];
}

type Rango = "30d" | "3m" | "6m";

const RANGOS: { key: Rango; label: string }[] = [
  { key: "30d", label: "30 días" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
];

function getCutoff(rango: Rango): Date {
  const now = new Date();
  switch (rango) {
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }
}

function getWeekKey(d: Date): string {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface AggregatedPoint {
  fecha: string;
  atenciones: number;
}

function aggregate(data: RawRow[], rango: Rango): AggregatedPoint[] {
  if (!data.length) return [];
  if (rango === "30d") {
    const map = new Map<string, number>();
    for (const p of data) {
      map.set(p.fecha, (map.get(p.fecha) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([fecha, atenciones]) => ({ fecha, atenciones }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  const map = new Map<string, number>();
  for (const p of data) {
    const d = new Date(`${p.fecha}T12:00:00`);
    const key = rango === "3m" ? getWeekKey(d) : getMonthKey(d);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([fecha, atenciones]) => ({ fecha, atenciones }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function formatAxisDate(value: string, rango: Rango): string {
  if (!value) return "";
  if (rango === "30d") {
    const d = new Date(`${value}T12:00:00`);
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
  }
  if (rango === "3m") {
    const [, w] = value.split("-W");
    return `W${w}`;
  }
  const d = new Date(`${value}-01T12:00:00`);
  return d.toLocaleDateString("es-CL", { month: "short", year: "2-digit" });
}

function formatTooltipDate(label: string, rango: Rango): string {
  if (!label) return "";
  if (rango === "30d") {
    const d = new Date(`${label}T12:00:00`);
    return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
  }
  if (rango === "3m") {
    return `Semana ${label.replace("-W", " – ")}`;
  }
  const d = new Date(`${label}-01T12:00:00`);
  return d.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const [rango, setRango] = React.useState<Rango>("30d");

  const filtered = React.useMemo(() => {
    if (!data.length) return [];
    const cutoff = getCutoff(rango);
    return data.filter((d) => new Date(`${d.fecha}T12:00:00`) >= cutoff);
  }, [data, rango]);

  const chartData = React.useMemo(() => aggregate(filtered, rango), [filtered, rango]);

  const resumen = React.useMemo(() => {
    const total = filtered.length;
    const confirmadas = filtered.filter((r) => r.confirmada === "SI").length;
    const atendidas = filtered.filter((r) => r.atendido === "SI").length;
    const pctConfirmadas = total ? Math.round((confirmadas / total) * 100) : 0;
    const pctAtendidas = total ? Math.round((atendidas / total) * 100) : 0;
    return { total, confirmadas, atendidas, pctConfirmadas, pctAtendidas };
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Chart card */}
      <Card className="flex-1 rounded-none border-0 ring-0">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="font-heading font-normal text-base">
            Histórico de Atenciones
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg border bg-muted/20 p-0.5">
            {RANGOS.map((r) => (
              <button
                key={r.key}
                type="button"
                data-active={rango === r.key ? true : undefined}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 font-medium text-muted-foreground text-xs transition-all hover:text-foreground data-active:bg-background data-active:text-foreground data-active:shadow-xs"
                onClick={() => setRango(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer key={rango} config={chartConfig} className="aspect-video h-60 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="atenciones-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0.02} />
                  </linearGradient>
                  <filter id="atenciones-glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor="var(--foreground)" floodOpacity="0.25" />
                    <feComposite in2="blur" operator="in" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value: string) => formatAxisDate(value, rango)}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      labelKey="fecha"
                      labelFormatter={(label: string) => formatTooltipDate(label, rango)}
                    />
                  }
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                />
                <Bar dataKey="atenciones" fill="var(--foreground)" opacity={0.12} radius={[2, 2, 0, 0]} />
                <Area
                  type="monotone"
                  dataKey="atenciones"
                  stroke="var(--foreground)"
                  strokeWidth={1.8}
                  fill="url(#atenciones-fill)"
                  filter="url(#atenciones-glow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Resumen card */}
      <Card className="w-full lg:w-72 shrink-0">
        <CardHeader>
          <CardTitle className="font-heading font-normal text-muted-foreground text-sm">
            Resumen
          </CardTitle>
          <div className="text-foreground text-xl tabular-nums leading-none tracking-tight">
            {resumen.total.toLocaleString("es-CL")}
          </div>
          <div className="text-xs text-muted-foreground">Total atenciones</div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} />
                <span className="text-xs text-muted-foreground">Confirmadas</span>
              </div>
              <div className="text-right">
                <div className="font-medium tabular-nums">
                  {resumen.confirmadas.toLocaleString("es-CL")}
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {resumen.pctConfirmadas}%
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
                <span className="text-xs text-muted-foreground">Atendidas</span>
              </div>
              <div className="text-right">
                <div className="font-medium tabular-nums">
                  {resumen.atendidas.toLocaleString("es-CL")}
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {resumen.pctAtendidas}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
