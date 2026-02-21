"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Pill, TestTube, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import type { PatientRecord, LabResult } from "@/lib/mock-data";

interface TimelineEvent {
  id: string;
  date: string;
  type: "evolution" | "med_start" | "lab" | "med_suspended";
  title: string;
  description: string;
  details?: string;
  labData?: LabResult[];
}

const EVENT_CONFIG: Record<
  TimelineEvent["type"],
  { icon: typeof FileText; color: string; badgeClass: string; label: string }
> = {
  evolution: {
    icon: FileText,
    color: "text-teal-500",
    badgeClass: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    label: "Evolución",
  },
  med_start: {
    icon: Pill,
    color: "text-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    label: "Medicación",
  },
  lab: {
    icon: TestTube,
    color: "text-violet-500",
    badgeClass: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    label: "Laboratorio",
  },
  med_suspended: {
    icon: XCircle,
    color: "text-red-500",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "Suspensión",
  },
};

function alertColor(alert: LabResult["alert"]): string {
  if (alert === "critical") return "text-red-500 font-semibold";
  if (alert === "warning") return "text-yellow-500 font-medium";
  return "text-green-500";
}

function alertBadgeVariant(alert: LabResult["alert"]): string {
  if (alert === "critical") return "bg-red-500/10 text-red-500 border-red-500/20";
  if (alert === "warning") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-green-500/10 text-green-500 border-green-500/20";
}

interface Props {
  record: PatientRecord;
}

export function TimelinePanel({ record }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const events = useMemo(() => {
    const items: TimelineEvent[] = [];

    // Evoluciones
    for (const evo of record.evolutions) {
      const motivo = evo.fields.find((f) => f.name === "Motivo de consulta")?.value ?? "";
      const allFields = evo.fields
        .map((f) => `**${f.name}:** ${f.value}`)
        .join("\n\n");
      items.push({
        id: `evo-${evo.id}`,
        date: evo.date,
        type: "evolution",
        title: `${evo.doctorName} - ${evo.specialty}`,
        description: motivo,
        details: allFields,
      });
    }

    // Medicaciones
    for (const med of record.medications) {
      if (med.status === "ACTIVE") {
        items.push({
          id: `med-start-${med.name}-${med.startDate}`,
          date: med.startDate,
          type: "med_start",
          title: `Inicio: ${med.name}`,
          description: `${med.dose}, ${med.frequency}`,
        });
      }
      if (med.status === "SUSPENDED") {
        items.push({
          id: `med-sus-${med.name}-${med.startDate}`,
          date: med.startDate,
          type: "med_suspended",
          title: `Suspendido: ${med.name}`,
          description: `${med.dose}, ${med.frequency}`,
        });
      }
    }

    // Labs agrupados por fecha
    const labsByDate = new Map<string, LabResult[]>();
    for (const lab of record.labs) {
      const existing = labsByDate.get(lab.date) ?? [];
      existing.push(lab);
      labsByDate.set(lab.date, existing);
    }
    for (const [date, labs] of labsByDate) {
      const alertCount = labs.filter((l) => l.alert !== "normal").length;
      const description =
        alertCount > 0
          ? `${labs.length} determinaciones, ${alertCount} fuera de rango`
          : `${labs.length} determinaciones, todos normales`;
      items.push({
        id: `lab-${date}`,
        date,
        type: "lab",
        title: "Resultados de laboratorio",
        description,
        labData: labs,
      });
    }

    // Ordenar por fecha descendente
    items.sort((a, b) => b.date.localeCompare(a.date));
    return items;
  }, [record]);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timeline del paciente
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {events.length} eventos en orden cronológico
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="relative pl-6 pb-4">
            {/* Linea vertical del timeline */}
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

            {events.map((event) => {
              const config = EVENT_CONFIG[event.type];
              const Icon = config.icon;
              const isExpanded = expandedId === event.id;
              const hasExpandableContent =
                event.type === "lab" || event.type === "evolution";

              return (
                <div key={event.id} className="relative mb-4 last:mb-0">
                  {/* Dot en el timeline */}
                  <div
                    className={`absolute -left-6 top-1 flex items-center justify-center h-5 w-5 rounded-full border-2 border-background bg-background`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>

                  {/* Contenido */}
                  <div
                    className={`rounded-lg border p-3 transition-colors ${
                      hasExpandableContent
                        ? "cursor-pointer hover:bg-muted/50"
                        : ""
                    }`}
                    onClick={
                      hasExpandableContent
                        ? () => toggleExpand(event.id)
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${config.badgeClass}`}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      {hasExpandableContent && (
                        <span className="text-muted-foreground shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.description}
                    </p>

                    {/* Expanded content */}
                    {isExpanded && event.type === "lab" && event.labData && (
                      <div className="mt-3 space-y-1.5 border-t pt-2">
                        {event.labData.map((lab) => (
                          <div
                            key={`${lab.testName}-${lab.date}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <span>{lab.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className={alertColor(lab.alert)}>
                                {lab.value} {lab.unit}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] ${alertBadgeVariant(lab.alert)}`}
                              >
                                {lab.alert === "normal"
                                  ? "Normal"
                                  : lab.alert === "warning"
                                    ? "Alerta"
                                    : "Crítico"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Ref: valores entre referenceMin y referenceMax
                        </p>
                      </div>
                    )}

                    {isExpanded && event.type === "evolution" && event.details && (
                      <div className="mt-3 border-t pt-2 text-xs space-y-2 leading-relaxed">
                        {event.details.split("\n\n").map((block, i) => {
                          const boldMatch = block.match(
                            /^\*\*(.+?):\*\*\s*([\s\S]*)$/
                          );
                          if (boldMatch) {
                            return (
                              <div key={i}>
                                <span className="font-semibold text-foreground">
                                  {boldMatch[1]}:
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  {boldMatch[2]}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <p key={i} className="text-muted-foreground">
                              {block}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  No hay eventos registrados para este paciente.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
