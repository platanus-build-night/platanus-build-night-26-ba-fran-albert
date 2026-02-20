"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";

interface EvolutionData {
  motivoConsulta?: string;
  enfermedadActual?: string;
  examenFisico?: string;
  diagnostico?: string;
  plan?: string;
  signosVitales?: string;
  raw?: string;
}

interface Props {
  patientId: string;
}

const FIELD_LABELS: Record<string, string> = {
  motivoConsulta: "Motivo de consulta",
  enfermedadActual: "Enfermedad actual",
  examenFisico: "Examen fisico",
  diagnostico: "Diagnostico",
  plan: "Plan",
  signosVitales: "Signos vitales",
};

export function EvolutionPanel({ patientId }: Props) {
  const [freeText, setFreeText] = useState("");
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } =
    useVoiceInput();

  function handleToggleVoice() {
    if (isListening) {
      stopListening();
      setFreeText((prev) => (prev ? prev + " " + transcript : transcript));
      resetTranscript();
    } else {
      startListening();
    }
  }

  async function handleGenerate() {
    const text = freeText.trim();
    if (!text) return;

    setLoading(true);
    setError(null);
    setEvolution(null);

    try {
      const res = await fetch("/api/generate-evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, freeText: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvolution(data.evolution);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar evolucion");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setEvolution(null);
    setFreeText("");
    setError(null);
    resetTranscript();
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Generar evolucion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-3">
        {!evolution ? (
          <>
            <div className="relative">
              <Textarea
                placeholder="Dictá o escribí la consulta en texto libre... Ej: 'Paciente consulta por dolor abdominal de 3 dias, localizado en FID, sin fiebre, Murphy negativo'"
                value={isListening ? freeText + " " + transcript : freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="min-h-[140px] pr-12 resize-none"
                disabled={loading}
              />
              {isSupported && (
                <Button
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  className="absolute bottom-2 right-2 h-8 w-8"
                  onClick={handleToggleVoice}
                  disabled={loading}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {isListening && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs text-red-500 font-medium">Escuchando...</span>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={loading || !freeText.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando evolucion...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Estructurar con IA
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              {evolution.raw ? (
                <p className="text-sm whitespace-pre-wrap">{evolution.raw}</p>
              ) : (
                Object.entries(FIELD_LABELS).map(([key, label]) => {
                  const value = evolution[key as keyof EvolutionData];
                  if (!value || typeof value !== "string") return null;
                  return (
                    <div key={key}>
                      <Badge variant="outline" className="mb-1 text-[10px]">
                        {label}
                      </Badge>
                      <p className="text-sm leading-relaxed">{value}</p>
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-[11px] text-muted-foreground border-t pt-2 mt-4">
              Generado por IA como asistencia al profesional medico. El criterio
              clinico del medico prevalece siempre.
            </p>

            <Button variant="outline" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Nueva evolucion
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
