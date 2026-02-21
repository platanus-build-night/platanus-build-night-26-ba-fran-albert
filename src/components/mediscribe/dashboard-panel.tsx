"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Pill,
  AlertTriangle,
  Activity,
  Calendar,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  Stethoscope,
  Droplets,
} from "lucide-react";
import type { PatientRecord, LabResult } from "@/lib/mock-data";

interface Props {
  record: PatientRecord;
}

function getLatestLabs(labs: LabResult[]): Map<string, LabResult> {
  const map = new Map<string, LabResult>();
  const sorted = [...labs].sort((a, b) => b.date.localeCompare(a.date));
  for (const lab of sorted) {
    if (!map.has(lab.testName)) {
      map.set(lab.testName, lab);
    }
  }
  return map;
}

function getLabTrend(
  labs: LabResult[],
  testName: string,
): "up" | "down" | "stable" | null {
  const points = labs
    .filter((l) => l.testName === testName)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (points.length < 2) return null;
  const last = points[points.length - 1].value;
  const prev = points[points.length - 2].value;
  if (prev === 0) return last === 0 ? "stable" : "up";
  const diff = ((last - prev) / prev) * 100;
  if (Math.abs(diff) < 2) return "stable";
  return diff > 0 ? "up" : "down";
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" | null }) {
  if (trend === "up")
    return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
  if (trend === "down")
    return <TrendingDown className="h-3.5 w-3.5 text-green-500" />;
  if (trend === "stable")
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  return null;
}

function RiskGauge({ score, label }: { score: number; label: string }) {
  const angle = (score / 100) * 180;
  const color =
    score >= 70
      ? "text-red-500"
      : score >= 40
        ? "text-yellow-500"
        : "text-green-500";
  const bgColor =
    score >= 70
      ? "stroke-red-500"
      : score >= 40
        ? "stroke-yellow-500"
        : "stroke-green-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-16 overflow-hidden">
        <svg viewBox="0 0 120 65" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            className="stroke-muted"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            className={bgColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 157} 157`}
          />
          {/* Needle */}
          <line
            x1="60"
            y1="60"
            x2={60 + 40 * Math.cos(((180 - angle) * Math.PI) / 180)}
            y2={60 - 40 * Math.sin(((180 - angle) * Math.PI) / 180)}
            className="stroke-foreground"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="3" className="fill-foreground" />
        </svg>
      </div>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function MiniSparkline({
  values,
  alerts,
}: {
  values: number[];
  alerts: LabResult["alert"][];
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const lastAlert = alerts[alerts.length - 1];
  const color =
    lastAlert === "critical"
      ? "#ef4444"
      : lastAlert === "warning"
        ? "#eab308"
        : "#22c55e";

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function computeRiskScore(record: PatientRecord): number {
  let score = 0;
  const { antecedentes, labs, medications } = record;

  const hasCondition = (name: string) =>
    antecedentes.some(
      (a) =>
        a.category === "PATOLOGICO" &&
        a.value === "SI" &&
        a.name.toLowerCase().includes(name.toLowerCase()),
    );

  if (hasCondition("hipertension") || hasCondition("HTA")) score += 15;
  if (hasCondition("diabetes")) score += 15;
  if (hasCondition("dislipemia") || hasCondition("colesterol")) score += 10;
  if (hasCondition("infarto") || hasCondition("IAM") || hasCondition("cardiopatia")) score += 20;
  if (hasCondition("insuficiencia cardiaca") || hasCondition("ICC")) score += 20;
  if (hasCondition("fibrilacion auricular") || hasCondition("FA")) score += 10;
  if (hasCondition("EPOC")) score += 10;
  if (hasCondition("IRC") || hasCondition("renal")) score += 10;

  const isSmoker = antecedentes.some(
    (a) =>
      a.name.toLowerCase().includes("tabaquismo") &&
      (a.value === "SI" || a.value?.includes("Ex-tabaquista")),
  );
  if (isSmoker) score += 10;

  if (record.patient.age >= 65) score += 10;
  if (record.patient.age >= 75) score += 5;

  const latestLabs = getLatestLabs(labs);
  const creatinina = latestLabs.get("Creatinina");
  if (creatinina && creatinina.value > 1.5) score += 10;
  const hba1c = latestLabs.get("HbA1c");
  if (hba1c && hba1c.value > 7.5) score += 5;
  const bnp = latestLabs.get("BNP");
  if (bnp && bnp.value > 300) score += 15;

  const activeMeds = medications.filter((m) => m.status === "ACTIVE");
  if (activeMeds.length >= 5) score += 5;

  return Math.min(score, 100);
}

export function DashboardPanel({ record }: Props) {
  const { antecedentes, evolutions, medications, labs } = record;

  const activeMeds = medications.filter((m) => m.status === "ACTIVE");
  const allergies = antecedentes.filter((a) => a.category === "ALERGIA" && a.value === "SI");
  const activeProblems = antecedentes.filter(
    (a) => a.category === "PATOLOGICO" && a.value === "SI",
  );

  const latestLabs = useMemo(() => getLatestLabs(labs), [labs]);
  const criticalLabs = useMemo(
    () => [...latestLabs.values()].filter((l) => l.alert === "critical"),
    [latestLabs],
  );
  const warningLabs = useMemo(
    () => [...latestLabs.values()].filter((l) => l.alert === "warning"),
    [latestLabs],
  );

  const lastEvolution = useMemo(() => {
    if (evolutions.length === 0) return null;
    return [...evolutions].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [evolutions]);

  const riskScore = useMemo(() => computeRiskScore(record), [record]);

  const keyLabTests = useMemo(() => {
    const testNames = ["Glucemia", "HbA1c", "Creatinina", "BNP", "Hemoglobina", "Colesterol total", "LDL"];
    const results: Array<{
      name: string;
      latest: LabResult;
      trend: "up" | "down" | "stable" | null;
      values: number[];
      alerts: LabResult["alert"][];
    }> = [];

    for (const name of testNames) {
      const latest = latestLabs.get(name);
      if (!latest) continue;
      const points = labs
        .filter((l) => l.testName === name)
        .sort((a, b) => a.date.localeCompare(b.date));
      results.push({
        name,
        latest,
        trend: getLabTrend(labs, name),
        values: points.map((p) => p.value),
        alerts: points.map((p) => p.alert),
      });
    }
    return results;
  }, [labs, latestLabs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Problems */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeProblems.length}</p>
              <p className="text-[11px] text-muted-foreground">
                Problemas activos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Medications */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Pill className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeMeds.length}</p>
              <p className="text-[11px] text-muted-foreground">Medicamentos</p>
            </div>
          </CardContent>
        </Card>

        {/* Lab Alerts */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {criticalLabs.length + warningLabs.length}
                </span>
                {criticalLabs.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[9px] px-1.5 py-0"
                  >
                    {criticalLabs.length} crit
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Alertas lab</p>
            </div>
          </CardContent>
        </Card>

        {/* Last Visit */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {lastEvolution
                  ? new Date(lastEvolution.date + "T00:00:00").toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {lastEvolution ? lastEvolution.specialty : "Sin visitas"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Gauge - Span 1 col */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              <span>Score de Riesgo Clínico</span>
            </div>
            <RiskGauge score={riskScore} label="Riesgo global" />
            <p className="text-[10px] text-muted-foreground mt-2 text-center max-w-[160px]">
              Basado en antecedentes, comorbilidades, edad y laboratorio
            </p>
          </CardContent>
        </Card>

        {/* Key Lab Values - Span 2 cols */}
        <Card className="border-border/50 bg-card/80 md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-4 text-xs font-medium text-muted-foreground">
              <Droplets className="h-3.5 w-3.5" />
              <span>Valores clave de laboratorio</span>
            </div>

            {keyLabTests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin datos de laboratorio
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {keyLabTests.map((test) => (
                  <div
                    key={test.name}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground truncate">
                        {test.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold ${
                            test.latest.alert === "critical"
                              ? "text-red-500"
                              : test.latest.alert === "warning"
                                ? "text-yellow-500"
                                : "text-foreground"
                          }`}
                        >
                          {test.latest.value}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {test.latest.unit}
                        </span>
                        <TrendIcon trend={test.trend} />
                      </div>
                    </div>
                    <MiniSparkline
                      values={test.values}
                      alerts={test.alerts}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Alergias</span>
            </div>
            {allergies.length === 0 ? (
              <p className="text-sm text-green-500 font-medium">
                Sin alergias conocidas
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((a) => (
                  <Badge
                    key={a.name}
                    variant="destructive"
                    className="text-xs"
                  >
                    {a.name}
                    {a.observations && (
                      <span className="ml-1 opacity-70">
                        ({a.observations})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Problems List */}
        <Card className="border-border/50 bg-card/80 md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Problemas activos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeProblems.map((p) => (
                <div
                  key={p.name}
                  className="flex items-start gap-2 p-2 rounded-lg border border-border/30 bg-muted/10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    {p.observations && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {p.observations}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
