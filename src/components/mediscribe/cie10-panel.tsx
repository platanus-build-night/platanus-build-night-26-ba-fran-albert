"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, Copy, Sparkles } from "lucide-react";
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
    <Card className="h-full flex flex-col overflow-hidden border-border/50 shadow-sm bg-card">
      <CardHeader className="pb-3 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            Sugerencias de Codificación CIE-10
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
              onClick={handleSuggest} 
              disabled={isStreaming}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-8"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Sugerir Códigos
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-4 pt-4 bg-card">
        <div className="space-y-1.5 px-1">
          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Detalles Clínicos Adicionales</label>
          <Textarea
            placeholder="Agregá más contexto para obtener códigos más específicos..."
            value={diagnosticText}
            onChange={(e) => setDiagnosticText(e.target.value)}
            className="min-h-[80px] max-h-[120px] resize-none border-border/50 bg-muted/20 focus-visible:ring-primary/20"
            disabled={isStreaming}
          />
        </div>

        <div className="flex-1 min-h-0 bg-muted/5 rounded-xl border border-border/50 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6">
              {!displayText && !isStreaming && (
                <div className="text-center py-12 space-y-3 opacity-60">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    La IA identificará los diagnósticos probables y sus correspondientes códigos CIE-10.
                  </p>
                </div>
              )}

              {isStreaming && !streamingText && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground font-medium animate-pulse">
                    Consultando catálogo CIE-10...
                  </span>
                </div>
              )}

              {displayText && (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-primary prose-strong:text-foreground">
                  <ReactMarkdown>{displayText}</ReactMarkdown>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}