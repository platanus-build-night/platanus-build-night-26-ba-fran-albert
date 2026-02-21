"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
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
      stroke="hsl(var(--background))"
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
    <div className="rounded-lg border bg-popover p-2.5 shadow-md text-popover-foreground">
      <p className="text-xs text-muted-foreground mb-1">{data.dateLabel}</p>
      <p className="text-sm font-semibold">
        <span
          style={{ color: alertDotColor(data.alert) }}
        >
          {data.value} {unit}
        </span>
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        Ref: {referenceMin} - {referenceMax} {unit}
      </p>
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

    // Solo series con 2+ data points, ordenar por fecha
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
    const min = Math.min(
      ...allValues,
      activeSeries.referenceMin
    );
    const max = Math.max(
      ...allValues,
      activeSeries.referenceMax
    );
    const padding = (max - min) * 0.15 || 5;
    return [Math.max(0, min - padding), max + padding];
  }, [activeSeries]);

  if (series.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendencia de laboratorio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No hay suficientes datos de laboratorio para mostrar tendencias.
            </p>
            <p className="text-xs text-muted-foreground">
              Se necesitan al menos 2 resultados del mismo análisis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Tendencia de laboratorio
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {series.length} análisis con tendencia disponible
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-3">
        {/* Test selector */}
        <div className="shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 pb-1">
            {series.map((s) => (
              <Badge
                key={s.testName}
                variant={selectedTest === s.testName ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap text-xs shrink-0 ${
                  selectedTest === s.testName
                    ? ""
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedTest(s.testName)}
              >
                {s.testName}
                <span className="ml-1 opacity-60">({s.dataPoints.length})</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Chart */}
        {activeSeries && (
          <div className="flex-1 min-h-0">
            <div className="h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeSeries.dataPoints}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  {/* Reference range area */}
                  <ReferenceArea
                    y1={activeSeries.referenceMin}
                    y2={activeSeries.referenceMax}
                    fill="hsl(var(--muted))"
                    fillOpacity={0.4}
                    stroke="none"
                  />

                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    domain={yDomain}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
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
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={<CustomDotComponent />}
                    activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                  Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  Alerta
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                  Crítico
                </span>
              </div>
              <span>
                Rango ref: {activeSeries.referenceMin}-{activeSeries.referenceMax}{" "}
                {activeSeries.unit}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
