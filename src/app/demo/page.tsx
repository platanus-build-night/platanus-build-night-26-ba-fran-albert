"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Menu, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PatientSelector } from "@/components/mediscribe/patient-selector";
import { PatientInfo } from "@/components/mediscribe/patient-info";
import { SummaryPanel } from "@/components/mediscribe/summary-panel";
import { EvolutionPanel } from "@/components/mediscribe/evolution-panel";
import { ChatPanel } from "@/components/mediscribe/chat-panel";
import { DiagnosisPanel } from "@/components/mediscribe/diagnosis-panel";
import { TimelinePanel } from "@/components/mediscribe/timeline-panel";
import { LabChartsPanel } from "@/components/mediscribe/lab-charts-panel";
import { InteractionsPanel } from "@/components/mediscribe/interactions-panel";
import { CIE10Panel } from "@/components/mediscribe/cie10-panel";
import { PrescriptionPanel } from "@/components/mediscribe/prescription-panel";
import type { PatientRecord } from "@/lib/mock-data";

export default function DemoPage() {
  const [selectedPatient, setSelectedPatient] =
    useState<PatientRecord | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b shrink-0">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">MediScribe</span>
            </div>
            <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
              Demo
            </span>
          </div>
          {selectedPatient && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              Paciente: {selectedPatient.patient.firstName}{" "}
              {selectedPatient.patient.lastName}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 fixed md:static z-40 md:z-auto
            w-64 border-r p-3 overflow-auto shrink-0 bg-background
            transition-transform duration-200 h-[calc(100vh-48px)] md:h-auto
          `}
        >
          <PatientSelector
            selectedId={selectedPatient?.patient.id ?? null}
            onSelect={(p) => {
              setSelectedPatient(p);
              setSidebarOpen(false);
            }}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 flex min-h-0">
          {!selectedPatient ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Seleccioná un paciente para empezar
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
              {/* Patient info sidebar - hidden on mobile, shown in tabs instead */}
              <div className="hidden md:block w-72 border-r p-4 overflow-auto shrink-0">
                <PatientInfo record={selectedPatient} />
              </div>

              {/* AI Panels */}
              <div className="flex-1 p-3 md:p-4 min-h-0">
                <Tabs
                  defaultValue="evolution"
                  className="h-full flex flex-col"
                >
                  <TabsList className="shrink-0 flex-wrap h-auto gap-1">
                    <TabsTrigger value="evolution" className="text-xs sm:text-sm">
                      Evolución
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="text-xs sm:text-sm">
                      Resumen HC
                    </TabsTrigger>
                    <TabsTrigger value="diagnosis" className="text-xs sm:text-sm">
                      Diagnóstico
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="text-xs sm:text-sm">
                      Chat IA
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs sm:text-sm">
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="labs" className="text-xs sm:text-sm">
                      Labs
                    </TabsTrigger>
                    <TabsTrigger value="interactions" className="text-xs sm:text-sm">
                      Interacciones
                    </TabsTrigger>
                    <TabsTrigger value="cie10" className="text-xs sm:text-sm">
                      CIE-10
                    </TabsTrigger>
                    <TabsTrigger value="prescription" className="text-xs sm:text-sm">
                      Receta
                    </TabsTrigger>
                    <TabsTrigger
                      value="patient"
                      className="text-xs sm:text-sm md:hidden"
                    >
                      Paciente
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-1 mt-3 min-h-0">
                    <TabsContent value="evolution" className="h-full mt-0">
                      <EvolutionPanel
                        key={selectedPatient.patient.id}
                        patientId={selectedPatient.patient.id}
                      />
                    </TabsContent>
                    <TabsContent value="summary" className="h-full mt-0">
                      <SummaryPanel
                        key={selectedPatient.patient.id}
                        patientId={selectedPatient.patient.id}
                      />
                    </TabsContent>
                    <TabsContent value="diagnosis" className="h-full mt-0">
                      <DiagnosisPanel
                        key={selectedPatient.patient.id}
                        patientId={selectedPatient.patient.id}
                      />
                    </TabsContent>
                    <TabsContent value="chat" className="h-full mt-0">
                      <ChatPanel
                        key={selectedPatient.patient.id}
                        patientId={selectedPatient.patient.id}
                        patientName={`${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}`}
                      />
                    </TabsContent>
                    <TabsContent value="timeline" className="h-full mt-0">
                      <TimelinePanel
                        key={`timeline-${selectedPatient.patient.id}`}
                        record={selectedPatient}
                      />
                    </TabsContent>
                    <TabsContent value="labs" className="h-full mt-0">
                      <LabChartsPanel
                        key={`labs-${selectedPatient.patient.id}`}
                        record={selectedPatient}
                      />
                    </TabsContent>
                    <TabsContent value="interactions" className="h-full mt-0">
                      <InteractionsPanel
                        key={`interactions-${selectedPatient.patient.id}`}
                        patientId={selectedPatient.patient.id}
                      />
                    </TabsContent>
                    <TabsContent value="cie10" className="h-full mt-0">
                      <CIE10Panel
                        key={`cie10-${selectedPatient.patient.id}`}
                        patientId={selectedPatient.patient.id}
                      />
                    </TabsContent>
                    <TabsContent value="prescription" className="h-full mt-0">
                      <PrescriptionPanel
                        key={`prescription-${selectedPatient.patient.id}`}
                        record={selectedPatient}
                      />
                    </TabsContent>
                    <TabsContent
                      value="patient"
                      className="h-full mt-0 md:hidden overflow-auto"
                    >
                      <Card className="h-full">
                        <CardContent className="p-4">
                          <PatientInfo record={selectedPatient} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Import Card for mobile patient tab
import { Card, CardContent } from "@/components/ui/card";
