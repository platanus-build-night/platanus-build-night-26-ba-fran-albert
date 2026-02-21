"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ShieldAlert, Copy, Sparkles, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Props {
  patientId: string;
}

export function InteractionsPanel({ patientId }: Props) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsStreaming(true);
    setResult(null);
    setStreamingText("");

    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });

      if (!res.ok) throw new Error("Error del servidor");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          const line = raw.trimEnd();
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch (e) { /* ignore */ }
          }
        }
      }

      setResult(fullText);
    } catch {
      setResult("Error al analizar interacciones. Intentá nuevamente.");
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Análisis copiado al portapapeles");
  }

  const displayText = isStreaming ? streamingText : result;

  return (
    <Card className="h-full flex flex-col overflow-hidden border-border/50 shadow-sm bg-card">
      <CardHeader className="pb-3 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
            Interacciones Medicamentosas
          </CardTitle>
          <div className="flex gap-2">
            {result && (
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
              onClick={handleAnalyze} 
              disabled={isStreaming}
              className="bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm h-8"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Analizar Seguridad
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-6 bg-card">
        <div className="flex-1 min-h-0 bg-destructive/[0.02] rounded-xl border border-destructive/10 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {!displayText && !isStreaming && (
                <div className="text-center py-12 space-y-3">
                  <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Verificá posibles interacciones entre todos los medicamentos activos registrados en la historia clínica.
                  </p>
                </div>
              )}

              {isStreaming && !streamingText && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-destructive" />
                  <span className="text-sm text-muted-foreground font-medium animate-pulse">
                    Cruzando farmacopeas...
                  </span>
                </div>
              )}

              {displayText && (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-destructive prose-strong:text-foreground">
                  <ReactMarkdown>{displayText}</ReactMarkdown>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-4 uppercase tracking-widest">
          Esta herramienta es informativa. El juicio profesional es primario.
        </p>
      </CardContent>
    </Card>
  );
}