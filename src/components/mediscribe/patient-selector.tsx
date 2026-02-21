"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PATIENTS, type PatientRecord } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

interface PatientSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  healthInsurance: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (record: PatientRecord) => void;
  mode?: "mock" | "ehr";
}

export function PatientSelector({ selectedId, onSelect, mode = "mock" }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  const searchEHR = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const data: PatientSearchResult[] = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Search failed:", err);
    } finally {
      if (!controller.signal.aborted) setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "ehr") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchEHR(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, mode, searchEHR]);

  const handleEhrSelect = async (result: PatientSearchResult) => {
    try {
      const res = await fetch(`/api/patients/${result.id}`);
      if (res.ok) {
        const record: PatientRecord = await res.json();
        onSelect(record);
      }
    } catch (err) {
      console.error("Failed to load patient:", err);
    }
  };

  // Mock mode: filter locally
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
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        Pacientes
      </h3>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Buscar paciente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {mode === "ehr" ? (
        <>
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">Buscando...</span>
            </div>
          )}
          {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No se encontraron pacientes
            </p>
          )}
          {!isSearching &&
            searchResults.map((result) => {
              const isSelected = selectedId === result.id;
              return (
                <button
                  key={result.id}
                  onClick={() => handleEhrSelect(result)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted border border-transparent",
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(isSelected && "bg-primary text-primary-foreground")}>
                      {result.firstName[0]}
                      {result.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {result.firstName} {result.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.age} anos - {result.healthInsurance}
                    </p>
                  </div>
                </button>
              );
            })}
          {!searchQuery.trim() && !isSearching && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Escribi un nombre para buscar
            </p>
          )}
        </>
      ) : (
        filteredMockPatients.map((record) => {
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
        })
      )}
    </div>
  );
}
