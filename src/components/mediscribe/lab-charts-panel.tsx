"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FlaskConical, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import type { PatientRecord, LabResult } from "@/lib/mock-data";

interface LabSeries {
  testName: string;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  dataPoints: {
    date: string;
    dateLabel: string;
    value: number;
    alert: LabResult["alert"];
  }[];
}

interface Props {
  record: PatientRecord;
}

function alertDotColor(alert: LabResult["alert"]): string {
  if (alert === "critical") return "#ef4444";
  if (alert === "warning") return "#eab308";
  return "#22c55e";
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: { alert: LabResult["alert"] };
}

function CustomDotComponent({ cx, cy, payload }: CustomDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={alertDotColor(payload.alert)}
      stroke="hsl(var(--card))"
      strokeWidth={2}
    />
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      dateLabel: string;
      value: number;
      alert: LabResult["alert"];
    };
  }>;
  unit: string;
  referenceMin: number;
  referenceMax: number;
}

function CustomTooltipContent({
  active,
  payload,
  unit,
  referenceMin,
  referenceMax,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-xl border bg-popover/90 backdrop-blur-md p-3 shadow-xl text-popover-foreground">
      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">{data.dateLabel}</p>
      <p className="text-base font-bold flex items-center gap-2">
        <span style={{ color: alertDotColor(data.alert) }}>
          {data.value}
        </span>
        <span className="text-xs font-medium opacity-60">{unit}</span>
      </p>
      <div className="mt-2 pt-2 border-t border-border/50">
         <p className="text-[9px] text-muted-foreground uppercase font-semibold">Rango Referencia</p>
         <p className="text-[10px] font-medium">{referenceMin} - {referenceMax} {unit}</p>
      </div>
    </div>
  );
}

export function LabChartsPanel({ record }: Props) {
  const series = useMemo(() => {
    const map = new Map<string, LabSeries>();

    for (const lab of record.labs) {
      let s = map.get(lab.testName);
      if (!s) {
        s = {
          testName: lab.testName,
          unit: lab.unit,
          referenceMin: lab.referenceMin,
          referenceMax: lab.referenceMax,
          dataPoints: [],
        };
        map.set(lab.testName, s);
      }
      const d = new Date(lab.date + "T00:00:00");
      s.dataPoints.push({
        date: lab.date,
        dateLabel: d.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }),
        value: lab.value,
        alert: lab.alert,
      });
    }

    const result: LabSeries[] = [];
    for (const s of map.values()) {
      if (s.dataPoints.length >= 2) {
        s.dataPoints.sort((a, b) => a.date.localeCompare(b.date));
        result.push(s);
      }
    }

    return result.sort((a, b) => a.testName.localeCompare(b.testName));
  }, [record.labs]);

  const [selectedTest, setSelectedTest] = useState<string>(
    series[0]?.testName ?? ""
  );

  const activeSeries = series.find((s) => s.testName === selectedTest);

  const yDomain = useMemo(() => {
    if (!activeSeries) return [0, 100];
    const allValues = activeSeries.dataPoints.map((d) => d.value);
    const min = Math.min(...allValues, activeSeries.referenceMin);
    const max = Math.max(...allValues, activeSeries.referenceMax);
    const padding = (max - min) * 0.2 || 5;
    return [Math.max(0, min - padding), max + padding];
  }, [activeSeries]);

  if (series.length === 0) {
    return (
      <Card className="h-full flex flex-col border-border/50 shadow-sm overflow-hidden bg-card">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Tendencias de Laboratorio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
            <FlaskConical className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">No hay suficientes datos</p>
            <p className="text-xs text-muted-foreground max-w-[250px]">
              Se requieren al menos dos determinaciones del mismo tipo para generar un gráfico de tendencia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-border/50 shadow-sm overflow-hidden bg-card">
      <CardHeader className="pb-3 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Evolución de Parámetros de Laboratorio
          </CardTitle>
          <Badge variant="outline" className="font-normal bg-card">
            {series.length} series
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-6 pt-6 bg-card">
        {/* Test selector */}
        <div className="shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-2 px-1">
            {series.map((s) => (
              <button
                key={s.testName}
                onClick={() => setSelectedTest(s.testName)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all
                  ${selectedTest === s.testName 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"}
                `}
              >
                {s.testName}
                <span className={`text-[10px] ${selectedTest === s.testName ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}>
                  ({s.dataPoints.length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {activeSeries && (
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            <div className="flex-1 min-h-[250px] bg-muted/5 rounded-2xl border border-border/50 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeSeries.dataPoints}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <ReferenceArea
                    y1={activeSeries.referenceMin}
                    y2={activeSeries.referenceMax}
                    fill="hsl(var(--muted))"
                    fillOpacity={0.2}
                    stroke="none"
                  />

                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                  />
                  <Tooltip
                    content={
                      <CustomTooltipContent
                        unit={activeSeries.unit}
                        referenceMin={activeSeries.referenceMin}
                        referenceMax={activeSeries.referenceMax}
                      />
                    }
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={<CustomDotComponent />}
                    activeDot={{ r: 8, stroke: "hsl(var(--background))", strokeWidth: 3 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Info / Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-2">
              <div className="flex items-center gap-4">
                <LegendItem color="bg-emerald-500" label="Normal" />
                <LegendItem color="bg-amber-500" label="Alerta" />
                <LegendItem color="bg-red-500" label="Crítico" />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-4 py-1.5 rounded-full border border-border/50">
                <span>Rango Referencia:</span>
                <span className="text-foreground">{activeSeries.referenceMin} - {activeSeries.referenceMax}</span>
                <span className="opacity-50">{activeSeries.unit}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{label}</span>
    </div>
  );
}