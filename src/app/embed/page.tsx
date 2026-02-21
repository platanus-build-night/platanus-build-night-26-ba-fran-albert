"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EvolutionPanel } from "@/components/mediscribe/evolution-panel";
import { ChatPanel } from "@/components/mediscribe/chat-panel";
import { DiagnosisPanel } from "@/components/mediscribe/diagnosis-panel";
import { SummaryPanel } from "@/components/mediscribe/summary-panel";
import { TimelinePanel } from "@/components/mediscribe/timeline-panel";
import { LabChartsPanel } from "@/components/mediscribe/lab-charts-panel";
import { InteractionsPanel } from "@/components/mediscribe/interactions-panel";
import { CIE10Panel } from "@/components/mediscribe/cie10-panel";
import { PrescriptionPanel } from "@/components/mediscribe/prescription-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import { PATIENTS } from "@/lib/mock-data";
import type { PatientRecord } from "@/lib/mock-data";

function EmbedContent() {
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const tabParam = searchParams.get("tab") || "evolution";

  const record: PatientRecord | undefined = patientIdParam
    ? PATIENTS.find((p) => p.patient.id === patientIdParam)
    : PATIENTS[0];

  if (!record) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Paciente no encontrado</p>
      </div>
    );
  }

  const patientName = `${record.patient.firstName} ${record.patient.lastName}`;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Minimal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium">MediScribe</span>
        <span className="text-xs text-muted-foreground">|</span>
        <span className="text-xs text-muted-foreground">{patientName}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 min-h-0">
        <Tabs defaultValue={tabParam} className="h-full flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="evolution" className="text-xs">
              Evolución
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="text-xs">
              Diagnóstico
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              Chat
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="labs" className="text-xs">
              Labs
            </TabsTrigger>
            <TabsTrigger value="interactions" className="text-xs">
              Interacciones
            </TabsTrigger>
            <TabsTrigger value="cie10" className="text-xs">
              CIE-10
            </TabsTrigger>
            <TabsTrigger value="prescription" className="text-xs">
              Receta
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 mt-2 min-h-0">
            <TabsContent value="evolution" className="h-full mt-0">
              <EvolutionPanel key={record.patient.id} patientId={record.patient.id} />
            </TabsContent>
            <TabsContent value="summary" className="h-full mt-0">
              <SummaryPanel key={record.patient.id} patientId={record.patient.id} />
            </TabsContent>
            <TabsContent value="diagnosis" className="h-full mt-0">
              <DiagnosisPanel key={record.patient.id} patientId={record.patient.id} />
            </TabsContent>
            <TabsContent value="chat" className="h-full mt-0">
              <ChatPanel
                key={record.patient.id}
                patientId={record.patient.id}
                patientName={patientName}
              />
            </TabsContent>
            <TabsContent value="timeline" className="h-full mt-0">
              <TimelinePanel key={record.patient.id} record={record} />
            </TabsContent>
            <TabsContent value="labs" className="h-full mt-0">
              <LabChartsPanel key={record.patient.id} record={record} />
            </TabsContent>
            <TabsContent value="interactions" className="h-full mt-0">
              <InteractionsPanel key={record.patient.id} patientId={record.patient.id} />
            </TabsContent>
            <TabsContent value="cie10" className="h-full mt-0">
              <CIE10Panel key={record.patient.id} patientId={record.patient.id} />
            </TabsContent>
            <TabsContent value="prescription" className="h-full mt-0">
              <PrescriptionPanel key={record.patient.id} record={record} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-background text-foreground">
          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
        </div>
      }
    >
      <EmbedContent />
    </Suspense>
  );
}
