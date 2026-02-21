"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Settings, 
  LogOut, 
  Search,
  Plus,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PATIENTS, type PatientRecord } from "@/lib/mock-data";

interface SidebarProps {
  selectedId: string | null;
  onSelect: (patient: PatientRecord) => void;
  className?: string;
}

export function Sidebar({ selectedId, onSelect, className }: SidebarProps) {
  return (
    <aside className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-80 shrink-0", className)}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Users className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
          <span className="font-semibold text-lg tracking-tight">MediScribe</span>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar paciente..." 
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border focus-visible:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pacientes
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 px-2">
          {PATIENTS.map((record) => (
            <PatientCard 
              key={record.patient.id} 
              record={record} 
              isSelected={selectedId === record.patient.id}
              onClick={() => onSelect(record)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer group">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. Francisco</p>
            <p className="text-xs text-muted-foreground truncate">Cardiología</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </aside>
  );
}

function PatientCard({ 
  record, 
  isSelected, 
  onClick 
}: { 
  record: PatientRecord; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  const p = record.patient;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group overflow-hidden",
        isSelected 
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="active-patient-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      <Avatar className={cn(
        "h-10 w-10 border transition-colors",
        isSelected ? "border-primary/20" : "border-transparent group-hover:border-sidebar-border"
      )}>
        <AvatarFallback className={cn(
          "font-medium",
          isSelected ? "bg-primary/10 text-primary" : "bg-sidebar-accent text-muted-foreground"
        )}>
          {p.firstName[0]}{p.lastName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn(
            "font-medium text-sm truncate",
            isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {p.firstName} {p.lastName}
          </span>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {p.age} años · {p.healthInsurance}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            09:30
          </span>
        </div>
      </div>
    </button>
  );
}
