"use client";

import { useMemo } from "react";
import {
  FileText,
  Pill,
  TestTube,
  XCircle,
  Clock,
  CalendarDays,
  Stethoscope
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { PatientRecord, LabResult } from "@/lib/mock-data";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  { icon: typeof FileText; color: string; bg: string; label: string }
> = {
  evolution: {
    icon: Stethoscope,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Consulta",
  },
  med_start: {
    icon: Pill,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Medicación",
  },
  lab: {
    icon: TestTube,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Laboratorio",
  },
  med_suspended: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Suspensión",
  },
};

interface Props {
  record: PatientRecord;
}

export function TimelinePanel({ record }: Props) {
  const events = useMemo(() => {
    const items: TimelineEvent[] = [];

    // Evoluciones
    for (const evo of record.evolutions) {
      const motivo = evo.fields.find((f) => f.name === "Motivo de consulta")?.value;
      const diag = evo.fields.find((f) => f.name === "Diagnóstico")?.value;
      
      const allFields = evo.fields
        .map((f) => `**${f.name}:** ${f.value}`)
        .join("\n\n");
        
      items.push({
        id: `evo-${evo.id}`,
        date: evo.date,
        type: "evolution",
        title: diag || "Consulta General",
        description: motivo || "Sin motivo registrado",
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
          description: `${med.dose} · ${med.frequency}`,
        });
      }
    }

    // Labs
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
          ? `${alertCount} valores fuera de rango`
          : `Todos los valores normales`;
      
      items.push({
        id: `lab-${date}`,
        date,
        type: "lab",
        title: "Análisis de Sangre",
        description,
        labData: labs,
      });
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [record]);

  return (
    <Card className="h-full flex flex-col overflow-hidden border-none shadow-none bg-transparent">
      <CardHeader className="pb-3 border-b bg-card rounded-t-xl border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Historia Clínica Cronológica
          </CardTitle>
          <Badge variant="secondary" className="font-medium">
             {events.length} eventos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="relative pl-16 pt-2 pb-10 space-y-8 bg-card rounded-xl border p-8">
              {/* Vertical Line */}
              <div className="absolute left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-border via-border to-transparent" />

              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto opacity-20 mb-3" />
                  <p>No hay eventos registrados</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-6">
                  {events.map((event) => {
                    const config = EVENT_CONFIG[event.type];
                    const Icon = config.icon;
                    const dateObj = new Date(event.date);
                    const isValidDate = !isNaN(dateObj.getTime());
                    const day = isValidDate ? format(dateObj, "dd", { locale: es }) : "?";
                    const month = isValidDate ? format(dateObj, "MMM", { locale: es }) : "?";
                    const year = isValidDate ? format(dateObj, "yyyy", { locale: es }) : "?";

                    return (
                      <AccordionItem 
                        key={event.id} 
                        value={event.id} 
                        className="relative border-none"
                      >
                        {/* Timeline Dot */}
                        <div className={cn(
                          "absolute left-[-49px] top-0 h-8 w-8 rounded-full border-4 border-card flex items-center justify-center z-10 shadow-sm transition-transform hover:scale-110",
                          config.bg,
                          config.color
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex flex-col gap-1 mb-2">
                           <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                             {day} {month} {year}
                             <span className="w-1 h-1 rounded-full bg-border" />
                             <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-foreground", config.color)}>
                                {config.label}
                             </span>
                           </span>
                           <AccordionTrigger className="hover:no-underline py-0 text-left">
                              <div className="flex-1">
                                 <h3 className="text-base font-semibold text-foreground leading-tight">
                                   {event.title}
                                 </h3>
                                 <p className="text-sm text-muted-foreground mt-0.5 font-normal">
                                   {event.description}
                                 </p>
                              </div>
                           </AccordionTrigger>
                        </div>

                        <AccordionContent className="pt-2 pl-1">
                           <div className="border-l-4 border-l-primary/20 bg-muted/20 p-4 rounded-r-lg rounded-l-sm">
                               {event.type === "lab" && event.labData && (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                   {event.labData.map((lab, i) => (
                                     <div key={i} className="flex justify-between items-center p-2 rounded bg-card border border-border/50">
                                        <span className="text-xs font-medium">{lab.testName}</span>
                                        <div className="text-right">
                                           <span className={cn(
                                             "text-xs font-bold block",
                                             lab.alert === "critical" ? "text-destructive" :
                                             lab.alert === "warning" ? "text-amber-500" : "text-emerald-500"
                                           )}>
                                             {lab.value} {lab.unit}
                                           </span>
                                           {lab.alert !== "normal" && (
                                             <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                                               {lab.alert === "critical" ? "Crítico" : "Alerta"}
                                             </span>
                                           )}
                                        </div>
                                     </div>
                                   ))}
                                 </div>
                               )}

                               {event.type === "evolution" && event.details && (
                                 <div className="space-y-3 text-sm">
                                   {event.details.split("\n\n").map((block, i) => {
                                     const parts = block.split("**");
                                     if (parts.length >= 3) {
                                       const label = parts[1].replace(":", "");
                                       const content = parts[2];
                                       return (
                                         <div key={i}>
                                           <span className="text-xs font-bold text-primary uppercase tracking-wide block mb-0.5">
                                             {label}
                                           </span>
                                           <p className="text-muted-foreground leading-relaxed">
                                             {content}
                                           </p>
                                         </div>
                                       )
                                     }
                                     return <p key={i}>{block}</p>
                                   })}
                                 </div>
                               )}
                               
                               {(event.type === "med_start" || event.type === "med_suspended") && (
                                 <p className="text-sm text-muted-foreground italic">
                                   Detalles del medicamento no disponibles en esta vista rápida.
                                 </p>
                               )}
                           </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}