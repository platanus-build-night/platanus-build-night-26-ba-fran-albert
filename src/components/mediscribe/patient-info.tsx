"use client";

import type { PatientRecord } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

interface Props {
  record: PatientRecord;
}

export function PatientInfo({ record }: Props) {
  const { patient, antecedentes, medications, labs } = record;
  const activeMeds = medications.filter((m) => m.status === "ACTIVE");
  const alertLabs = labs.filter((l) => l.alert !== "normal");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          {patient.firstName} {patient.lastName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {patient.age} anos | {patient.gender === "M" ? "Masculino" : "Femenino"} | {patient.bloodType}
          {patient.rhFactor} | DNI {patient.documentNumber}
        </p>
        <p className="text-sm text-muted-foreground">{patient.healthInsurance}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Antecedentes relevantes</h3>
        <div className="flex flex-wrap gap-1.5">
          {antecedentes
            .filter((a) => a.value === "SI" || (a.value !== "NO" && a.category === "HABITO"))
            .map((a, i) => (
              <Badge
                key={i}
                variant={a.category === "ALERGIA" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {a.name}
                {a.category === "HABITO" ? `: ${a.value}` : ""}
              </Badge>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">
          Medicacion activa ({activeMeds.length})
        </h3>
        <div className="space-y-1">
          {activeMeds.map((m, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{m.name}</span> - {m.dose},{" "}
              {m.frequency}
            </p>
          ))}
        </div>
      </div>

      {alertLabs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Laboratorio - Alertas</h3>
          <div className="space-y-1">
            {alertLabs.map((l, i) => (
              <p key={i} className="text-xs">
                <Badge
                  variant={l.alert === "critical" ? "destructive" : "outline"}
                  className="text-[10px] mr-1.5"
                >
                  {l.alert === "critical" ? "CRITICO" : "ALERTA"}
                </Badge>
                {l.testName}: {l.value} {l.unit}{" "}
                <span className="text-muted-foreground">
                  (ref: {l.referenceMin}-{l.referenceMax})
                </span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
