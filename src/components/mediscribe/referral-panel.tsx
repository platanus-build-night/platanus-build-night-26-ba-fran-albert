"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UserPlus, Copy, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Props {
  patientId: string;
}

export function ReferralPanel({ patientId }: Props) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setResult(null);
    setStreamingText("");

    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Error del servidor");
      if (!res.body) throw new Error("Sin cuerpo de respuesta");

      const reader = res.body.getReader();
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
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch (e) {
              if (
                e instanceof Error &&
                e.message !== "Unexpected end of JSON input"
              )
                throw e;
            }
          }
        }
      }

      buffer += decoder.decode();
      if (buffer.trimEnd().startsWith("data: ")) {
        const data = buffer.trimEnd().slice(6);
        if (data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
            }
          } catch {
            /* ignore trailing partial */
          }
        }
      }

      setResult(fullText);
    } catch {
      setResult(
        "Error al generar sugerencias de derivación. Intentá nuevamente.",
      );
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Derivaciones copiadas al portapapeles");
  }

  const displayText = isStreaming ? streamingText : result;

  return (
    <Card className="h-full flex flex-col border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-emerald-500" />
            </div>
            Derivaciones Inteligentes
          </CardTitle>
          <div className="flex gap-1.5">
            {result && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-7 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            )}
            <Button size="sm" onClick={handleGenerate} disabled={isStreaming}>
              {isStreaming ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Sugerir derivaciones
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          La IA analiza la HC completa y sugiere derivaciones a especialistas
          con nivel de urgencia.
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          {!displayText && !isStreaming && (
            <div className="text-center py-12 space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                <UserPlus className="h-8 w-8 text-emerald-500/60" />
              </div>
              <h3 className="font-medium">Derivaciones inteligentes</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Analizá toda la historia clínica del paciente para obtener
                sugerencias de derivaciones a especialistas, ordenadas por
                urgencia.
              </p>
            </div>
          )}

          {isStreaming && !streamingText && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mr-3" />
              <span className="text-sm text-muted-foreground">
                Analizando historia clínica...
              </span>
            </div>
          )}

          {displayText && (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-emerald-600 dark:prose-headings:text-emerald-400 prose-p:leading-relaxed pb-2">
              <ReactMarkdown>{displayText}</ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
