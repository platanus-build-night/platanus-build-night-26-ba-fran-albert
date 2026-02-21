"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Settings,
  LogOut,
  Search,
  Plus,
  ChevronRight,
  MoreVertical,
  Loader2
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
  mode?: "mock" | "ehr";
  className?: string;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  healthInsurance: string;
}

export function Sidebar({ selectedId, onSelect, mode = "mock", className }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const shouldSearch = mode === "ehr" && searchQuery.trim().length > 0;

  useEffect(() => {
    if (!shouldSearch) return;

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);

      fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Search failed: ${res.status}`);
          return res.json();
        })
        .then((data: SearchResult[]) => setSearchResults(data))
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        })
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [shouldSearch, searchQuery]);

  function handleSelectSearchResult(result: SearchResult) {
    fetch(`/api/patients/${result.id}`)
      .then((res) => {
        if (!res.ok) {
          console.error(`[sidebar] Patient fetch failed: ${res.status}`);
          return null;
        }
        return res.json();
      })
      .then((record: PatientRecord | null) => {
        if (record) onSelect(record);
      })
      .catch((err) => console.error("[sidebar] Patient fetch error:", err));
  }

  const filteredMockPatients = searchQuery.trim()
    ? PATIENTS.filter((r) => {
        const q = searchQuery.toLowerCase();
        const p = r.patient;
        return (
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.documentNumber.includes(q)
        );
      })
    : PATIENTS;

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
            placeholder={mode === "ehr" ? "Buscar en EHR..." : "Buscar paciente..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border focus-visible:ring-sidebar-ring"
          />
          {searching && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </div>

      {/* Patient List */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {mode === "ehr" ? "Resultados" : "Pacientes"}
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 px-2">
          {mode === "ehr" ? (
            searchQuery.trim() ? (
              searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <SearchResultCard
                    key={result.id}
                    result={result}
                    isSelected={selectedId === result.id}
                    onClick={() => handleSelectSearchResult(result)}
                  />
                ))
              ) : !searching ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Sin resultados
                </p>
              ) : null
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Buscá un paciente por nombre o DNI
              </p>
            )
          ) : (
            filteredMockPatients.map((record) => (
              <PatientCard
                key={record.patient.id}
                record={record}
                isSelected={selectedId === record.patient.id}
                onClick={() => onSelect(record)}
              />
            ))
          )}
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
            <p className="text-sm font-medium truncate">Dr. Demo</p>
            <p className="text-xs text-muted-foreground truncate">Medicina General</p>
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

function SearchResultCard({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
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
          {result.firstName[0]}{result.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 z-10">
        <span className={cn(
          "font-medium text-sm truncate block",
          isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {result.firstName} {result.lastName}
        </span>
        <span className="text-xs text-muted-foreground truncate block">
          {result.age} años · {result.healthInsurance}
        </span>
      </div>
    </button>
  );
}
