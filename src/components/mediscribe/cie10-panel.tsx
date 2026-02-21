"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Props {
  patientId: string;
}

export function CIE10Panel({ patientId }: Props) {
  const [diagnosticText, setDiagnosticText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  async function handleSuggest() {
    setIsStreaming(true);
    setResult(null);
    setStreamingText("");

    try {
      const res = await fetch("/api/cie10", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          diagnosticText: diagnosticText.trim() || undefined,
        }),
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
      setResult("Error al sugerir códigos CIE-10. Intentá nuevamente.");
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Códigos CIE-10 copiados al portapapeles");
  }

  const displayText = isStreaming ? streamingText : result;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Codificación CIE-10
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
            <Button size="sm" onClick={handleSuggest} disabled={isStreaming}>
              {isStreaming ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Generando...
                </>
              ) : (
                "Sugerir códigos CIE-10"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-3">
        <Textarea
          placeholder="(Opcional) Agregá contexto diagnóstico adicional para mayor precisión..."
          value={diagnosticText}
          onChange={(e) => setDiagnosticText(e.target.value)}
          className="min-h-[60px] max-h-[100px] resize-none shrink-0"
          disabled={isStreaming}
        />

        <ScrollArea className="flex-1">
          {!displayText && !isStreaming && (
            <div className="text-center py-8 space-y-2">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Generá sugerencias de códigos CIE-10 basadas en la HC del
                paciente.
              </p>
              <p className="text-xs text-muted-foreground">
                Opcionalmente, agregá contexto diagnóstico para mayor
                precisión.
              </p>
            </div>
          )}

          {isStreaming && !streamingText && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
              <span className="text-sm text-muted-foreground">
                Analizando datos clínicos...
              </span>
            </div>
          )}

          {displayText && (
            <div className="prose prose-sm max-w-none dark:prose-invert pb-2">
              <ReactMarkdown>{displayText}</ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
