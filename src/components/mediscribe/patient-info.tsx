"use client";

import type { PatientRecord } from "@/lib/mock-data";
import { 
  User, 
  HeartPulse, 
  Pill, 
  AlertTriangle, 
  Activity, 
  Droplet,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  record: PatientRecord;
}

export function PatientInfo({ record }: Props) {
  const { patient, antecedentes, medications, labs } = record;
  const activeMeds = medications.filter((m) => m.status === "ACTIVE");
  const alertLabs = labs.filter((l) => l.alert !== "normal");
  const allergies = antecedentes.filter(a => a.category === "ALERGIA");
  const chronic = antecedentes.filter(a => a.category === "PATOLOGICO");
  const habits = antecedentes.filter(a => a.category === "HABITO");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Card */}
      <Card className="overflow-hidden shadow-sm bg-card border-border/50">
        <div className="h-20 bg-primary/5 w-full relative border-b border-border/50">
           <div className="absolute inset-0 opacity-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--foreground) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        <CardContent className="relative pt-0 px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 mb-4">
            <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                {patient.firstName[0]}{patient.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {patient.age} años
                </span>
                <span className="text-border">|</span>
                <span>{patient.gender === "M" ? "Masculino" : "Femenino"}</span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Droplet className="h-3.5 w-3.5 text-red-500" />
                  {patient.bloodType}{patient.rhFactor}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                  {patient.healthInsurance}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
             <InfoItem icon={<Phone className="h-4 w-4" />} label="Teléfono" value="+54 9 11 1234-5678" />
             <InfoItem icon={<MapPin className="h-4 w-4" />} label="Dirección" value="Av. Libertador 1234, CABA" />
             <InfoItem icon={<Calendar className="h-4 w-4" />} label="Última Visita" value="15 Oct 2023" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medical Background */}
        <Card className="h-full border-border/50 shadow-sm bg-card">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Antecedentes Clínicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-wider">Patologías Crónicas</h4>
              <div className="flex flex-wrap gap-2">
                {chronic.length > 0 ? chronic.map((c, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 bg-muted/50 text-foreground border-border/50">
                    {c.name}
                  </Badge>
                )) : <span className="text-sm text-muted-foreground italic">Ninguna registrada</span>}
              </div>
            </div>
            
            <Separator className="opacity-50" />
            
            <div>
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2 tracking-wider">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                Alergias
              </h4>
              <div className="flex flex-wrap gap-2">
                 {allergies.length > 0 ? allergies.map((a, i) => (
                  <Badge key={i} variant="destructive" className="px-3 py-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                    {a.name}
                  </Badge>
                )) : <span className="text-sm text-muted-foreground italic">Niega alergias</span>}
              </div>
            </div>

            <Separator className="opacity-50" />

             <div>
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-2 tracking-wider">Hábitos</h4>
              <div className="flex flex-wrap gap-2">
                 {habits.length > 0 ? habits.map((h, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1 border-border/50">
                    {h.name}: {h.value}
                  </Badge>
                )) : <span className="text-sm text-muted-foreground italic">Sin datos</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medications & Labs */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-5 w-5 text-purple-500" />
                Medicación Activa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {activeMeds.length > 0 ? activeMeds.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.dose} · {m.frequency}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-background border-border/50">
                      Activo
                    </Badge>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Sin medicación activa</p>}
              </div>
            </CardContent>
          </Card>

          {alertLabs.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <HeartPulse className="h-5 w-5" />
                  Alertas de Laboratorio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertLabs.map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-background/80 border border-destructive/10">
                      <div>
                        <p className="font-medium text-sm">{l.testName}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.value} {l.unit} <span className="opacity-70">(ref: {l.referenceMin}-{l.referenceMax})</span>
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-[10px] h-5">
                        {l.alert === "critical" ? "CRÍTICO" : "ANORMAL"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
