"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientSelector } from "@/components/mediscribe/patient-selector";
import { PatientInfo } from "@/components/mediscribe/patient-info";
import { SummaryPanel } from "@/components/mediscribe/summary-panel";
import { EvolutionPanel } from "@/components/mediscribe/evolution-panel";
import { ChatPanel } from "@/components/mediscribe/chat-panel";
import type { PatientRecord } from "@/lib/mock-data";

function DemoContent() {
  const searchParams = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    null,
  );
  const [dataMode, setDataMode] = useState<"mock" | "ehr">("mock");

  useEffect(() => {
    const token = searchParams.get("token");
    const patientId = searchParams.get("patientId");

    if (!token) return;

    fetch("/api/auth/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data: { mode: "mock" | "ehr" }) => {
        setDataMode(data.mode);
        window.history.replaceState({}, "", "/demo");

        if (patientId) {
          fetch(`/api/patients/${patientId}`)
            .then((res) => {
              if (res.ok) return res.json();
              return null;
            })
            .then((record: PatientRecord | null) => {
              if (record) setSelectedPatient(record);
            });
        }
      })
      .catch((err) => console.error("EHR init failed:", err));
  }, [searchParams]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b shrink-0">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              {dataMode === "ehr" ? "EHR" : "Demo"}
            </span>
          </div>
          {selectedPatient && (
            <span className="text-sm text-muted-foreground">
              Paciente: {selectedPatient.patient.firstName}{" "}
              {selectedPatient.patient.lastName}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-64 border-r p-3 overflow-auto shrink-0">
          <PatientSelector
            selectedId={selectedPatient?.patient.id ?? null}
            onSelect={setSelectedPatient}
            mode={dataMode}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 flex min-h-0">
          {!selectedPatient ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Selecciona un paciente para empezar
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex min-h-0">
              {/* Patient info sidebar */}
              <div className="w-72 border-r p-4 overflow-auto shrink-0">
                <PatientInfo record={selectedPatient} />
              </div>

              {/* AI Panels */}
              <div className="flex-1 p-4 min-h-0">
                <Tabs defaultValue="evolution" className="h-full flex flex-col">
                  <TabsList className="shrink-0">
                    <TabsTrigger value="evolution">
                      Generar evolucion
                    </TabsTrigger>
                    <TabsTrigger value="summary">Resumen HC</TabsTrigger>
                    <TabsTrigger value="chat">Chat IA</TabsTrigger>
                  </TabsList>
                  <div className="flex-1 mt-3 min-h-0">
                    <TabsContent value="evolution" className="h-full mt-0">
                      <EvolutionPanel key={selectedPatient.patient.id} patientId={selectedPatient.patient.id} />
                    </TabsContent>
                    <TabsContent value="summary" className="h-full mt-0">
                      <SummaryPanel key={selectedPatient.patient.id} patientId={selectedPatient.patient.id} />
                    </TabsContent>
                    <TabsContent value="chat" className="h-full mt-0">
                      <ChatPanel
                        key={selectedPatient.patient.id}
                        patientId={selectedPatient.patient.id}
                        patientName={`${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}`}
                      />
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

export default function DemoPage() {
  return (
    <Suspense>
      <DemoContent />
    </Suspense>
  );
}
