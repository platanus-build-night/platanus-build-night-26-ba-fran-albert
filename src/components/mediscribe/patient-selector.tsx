"use client";

import { PATIENTS, type PatientRecord } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string | null;
  onSelect: (record: PatientRecord) => void;
}

export function PatientSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        Pacientes
      </h3>
      {PATIENTS.map((record) => {
        const p = record.patient;
        const isSelected = selectedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(record)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
              isSelected
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted border border-transparent",
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className={cn(isSelected && "bg-primary text-primary-foreground")}>
                {p.firstName[0]}
                {p.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {p.firstName} {p.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.age} anos - {p.healthInsurance}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
