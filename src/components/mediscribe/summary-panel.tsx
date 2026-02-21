"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Copy, Sparkles, BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { PatientInfo } from "./patient-info";
import type { PatientRecord } from "@/lib/mock-data";

interface Props {
  record: PatientRecord;
}

export function SummaryPanel({ record }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: record.patient.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar resumen");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    toast.success("Resumen copiado al portapapeles");
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      {/* Patient Dashboard Card */}
      <PatientInfo record={record} />

      {/* AI Summary Section */}
      <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              Resumen Clínico Inteligente
            </CardTitle>
            <div className="flex gap-2">
              {summary && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-8 text-xs"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copiar
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={handleSummarize} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Analizando HC...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Generar Resumen IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 min-h-[150px] bg-card">
          {!summary && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-60">
              <BrainCircuit className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground max-w-sm">
                Utilizá la inteligencia artificial para analizar todo el historial del paciente y generar un resumen conciso y relevante.
              </p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
               <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                 <Loader2 className="h-5 w-5 text-destructive" />
               </div>
               <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
          
          {loading && (
             <div className="space-y-4 py-4 animate-pulse">
                <div className="h-4 bg-primary/10 rounded w-3/4" />
                <div className="h-4 bg-primary/10 rounded w-full" />
                <div className="h-4 bg-primary/10 rounded w-5/6" />
                <div className="h-4 bg-primary/10 rounded w-2/3" />
             </div>
          )}

          {summary && (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-primary prose-strong:text-foreground prose-p:leading-relaxed bg-muted/20 p-6 rounded-xl border border-border/50">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
