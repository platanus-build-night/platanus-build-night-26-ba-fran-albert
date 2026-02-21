"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  FileText,
  Activity,
  MessageSquare,
  FlaskConical,
  Clock,
  Pill,
  BookOpen,
  LayoutDashboard,
  Heart,
  UserPlus,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/mediscribe/sidebar"; // New sidebar
import { PatientInfo } from "@/components/mediscribe/patient-info"; // Will need refactor later
import { SummaryPanel } from "@/components/mediscribe/summary-panel";
import { EvolutionPanel } from "@/components/mediscribe/evolution-panel";
import { ChatPanel } from "@/components/mediscribe/chat-panel";
import { DiagnosisPanel } from "@/components/mediscribe/diagnosis-panel";
import { TimelinePanel } from "@/components/mediscribe/timeline-panel";
import { LabChartsPanel } from "@/components/mediscribe/lab-charts-panel";
import { InteractionsPanel } from "@/components/mediscribe/interactions-panel";
import { CIE10Panel } from "@/components/mediscribe/cie10-panel";
import { PrescriptionPanel } from "@/components/mediscribe/prescription-panel";
import { DashboardPanel } from "@/components/mediscribe/dashboard-panel";
import { PatientSummaryPanel } from "@/components/mediscribe/patient-summary-panel";
import { ReferralPanel } from "@/components/mediscribe/referral-panel";
import { ModeToggle } from "@/components/mode-toggle";
import { EhrConfigDialog } from "@/components/mediscribe/ehr-config-dialog";
import type { PatientRecord } from "@/lib/mock-data";

export default function DemoPage() {
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dataMode, setDataMode] = useState<"mock" | "ehr">("mock");

  // Solo chat y evolution necesitan layout fijo (input abajo / side-by-side)
  // El resto scrollea naturalmente con el contenedor padre
  const fixedTabs = ["chat", "evolution"];
  const isFixedLayout = fixedTabs.includes(activeTab);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          selectedId={selectedPatient?.patient.id ?? null}
          onSelect={(p) => {
            setSelectedPatient(p);
            setSidebarOpen(false);
          }}
          mode={dataMode}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header (Mobile & Desktop) */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-xl shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3 md:hidden">
             <Button
              size="icon"
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">MediScribe</span>
          </div>

          {/* Breadcrumbs / Title */}
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
             <Link href="/" className="hover:text-foreground transition-colors mr-2">
               Inicio
             </Link>
             <span className="text-muted-foreground/40 mx-2">/</span>
             <span className="font-medium text-foreground">
               {selectedPatient 
                 ? `${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}` 
                 : "Seleccionar Paciente"}
             </span>
          </div>

          <div className="flex items-center gap-2">
            {dataMode === "ehr" && (
              <span className="text-xs text-green-500 border border-green-500/30 rounded px-1.5 py-0.5 hidden sm:block">
                EHR
              </span>
            )}
            <EhrConfigDialog
              dataMode={dataMode}
              onConnect={() => {
                setDataMode("ehr");
                setSelectedPatient(null);
              }}
              onDisconnect={() => {
                setDataMode("mock");
                setSelectedPatient(null);
              }}
            />
            <ModeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Nueva Consulta</span>
            </Button>
            <Avatar className="h-8 w-8 ml-2 md:hidden">
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dynamic Content */}
        {!selectedPatient ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="bg-primary/5 p-6 rounded-full mb-6 ring-1 ring-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Bienvenido a MediScribe</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Seleccioná un paciente de la barra lateral para comenzar a documentar, ver su historia clínica o interactuar con el asistente IA.
            </p>
            <Button onClick={() => setSidebarOpen(true)} className="md:hidden">
              Ver Pacientes
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Patient Header / Summary Strip */}
            <div className="px-6 py-4 bg-muted/30 border-b shrink-0">
               <div className="flex items-center justify-between">
                 <div>
                   <h1 className="text-2xl font-bold tracking-tight">
                     {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                   </h1>
                   <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                     <span className="flex items-center gap-1.5">
                       <Clock className="h-3.5 w-3.5" />
                       Última visita: Hace 2 meses
                     </span>
                     <span className="text-muted-foreground/30">•</span>
                     <span>{selectedPatient.patient.age} años</span>
                     <span className="text-muted-foreground/30">•</span>
                     <span>{selectedPatient.patient.healthInsurance}</span>
                   </div>
                 </div>
                 {/* Status Badge */}
                 <div className="hidden sm:block px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                   Activo
                 </div>
               </div>
            </div>

            {/* Tabs & Panels */}
            <Tabs 
              defaultValue="dashboard" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-6 pt-2 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <TabsList className="h-12 bg-transparent p-0 gap-6 w-full justify-start overflow-x-auto no-scrollbar">
                  <TabItem value="dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" isActive={activeTab === "dashboard"} />
                  <TabItem value="evolution" icon={<FileText className="h-4 w-4" />} label="Evolución" isActive={activeTab === "evolution"} />
                  <TabItem value="chat" icon={<MessageSquare className="h-4 w-4" />} label="Chat IA" isActive={activeTab === "chat"} />
                  <TabItem value="summary" icon={<Activity className="h-4 w-4" />} label="Resumen" isActive={activeTab === "summary"} />
                  <TabItem value="timeline" icon={<Clock className="h-4 w-4" />} label="Historia" isActive={activeTab === "timeline"} />
                  <TabItem value="labs" icon={<FlaskConical className="h-4 w-4" />} label="Laboratorio" isActive={activeTab === "labs"} />
                  <TabItem value="prescription" icon={<Pill className="h-4 w-4" />} label="Receta" isActive={activeTab === "prescription"} />
                  <TabItem value="diagnosis" icon={<BookOpen className="h-4 w-4" />} label="Diagnóstico" isActive={activeTab === "diagnosis"} />
                  <TabItem value="patient-summary" icon={<Heart className="h-4 w-4" />} label="Para Paciente" isActive={activeTab === "patient-summary"} />
                  <TabItem value="referral" icon={<UserPlus className="h-4 w-4" />} label="Derivaciones" isActive={activeTab === "referral"} />
                </TabsList>
              </div>

              <div className={`flex-1 min-h-0 bg-muted/10 p-4 md:p-6 ${isFixedLayout ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
                <div className={`max-w-6xl mx-auto w-full ${isFixedLayout ? "flex-1 min-h-0 flex flex-col" : ""}`}>
                  {/* We use key to force re-mount when patient changes for clean state */}
                  <TabsContent value="dashboard" className="mt-0 focus-visible:ring-0">
                    <DashboardPanel key={`dash-${selectedPatient.patient.id}`} record={selectedPatient} />
                  </TabsContent>

                  <TabsContent value="evolution" className="mt-0 flex-1 min-h-0 focus-visible:ring-0">
                    <EvolutionPanel key={selectedPatient.patient.id} patientId={selectedPatient.patient.id} />
                  </TabsContent>
                  
                  <TabsContent value="chat" className="mt-0 flex-1 min-h-0 focus-visible:ring-0">
                    <ChatPanel 
                      key={selectedPatient.patient.id} 
                      patientId={selectedPatient.patient.id}
                      patientName={`${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}`}
                    />
                  </TabsContent>

                  <TabsContent value="summary" className="mt-0 focus-visible:ring-0">
                    <SummaryPanel key={selectedPatient.patient.id} record={selectedPatient} />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0 focus-visible:ring-0">
                    <TimelinePanel key={`timeline-${selectedPatient.patient.id}`} record={selectedPatient} />
                  </TabsContent>

                  <TabsContent value="labs" className="mt-0 focus-visible:ring-0">
                    <LabChartsPanel key={`labs-${selectedPatient.patient.id}`} record={selectedPatient} />
                  </TabsContent>

                  <TabsContent value="prescription" className="mt-0 focus-visible:ring-0">
                     <PrescriptionPanel key={`presc-${selectedPatient.patient.id}`} record={selectedPatient} />
                  </TabsContent>

                  <TabsContent value="diagnosis" className="mt-0 focus-visible:ring-0">
                    <DiagnosisPanel key={`diag-${selectedPatient.patient.id}`} patientId={selectedPatient.patient.id} />
                  </TabsContent>

                  <TabsContent value="patient-summary" className="mt-0 focus-visible:ring-0">
                    <PatientSummaryPanel key={`psummary-${selectedPatient.patient.id}`} record={selectedPatient} />
                  </TabsContent>

                  <TabsContent value="referral" className="mt-0 focus-visible:ring-0">
                    <ReferralPanel key={`referral-${selectedPatient.patient.id}`} patientId={selectedPatient.patient.id} />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

// Custom Tab Item for better styling
function TabItem({ value, icon, label, isActive }: { value: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <TabsTrigger 
      value={value}
      className={`
        relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0
        data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none
        hover:text-foreground
      `}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {isActive && (
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </TabsTrigger>
  );
}

// Helper Avatar component since I removed the import from ui/avatar in the main file to avoid conflict?
// Actually I imported it above.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";