"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Loader2,
  Sparkles,
  RotateCcw,
  Copy,
  FileDown,
  Pencil,
  Check,
} from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface EvolutionFields {
  [key: string]: string;
}

const FIELD_ORDER = [
  "Motivo de consulta",
  "Enfermedad actual",
  "Examen físico",
  "Signos vitales",
  "Diagnóstico",
  "Plan",
];

function parseEvolutionMarkdown(text: string): EvolutionFields {
  const fields: EvolutionFields = {};
  const regex = /\*\*(.+?):\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (value) fields[key] = value;
  }
  return fields;
}

function fieldsToText(fields: EvolutionFields): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}:\n${value}`)
    .join("\n\n");
}

interface Props {
  patientId: string;
}

export function EvolutionPanel({ patientId }: Props) {
  const [freeText, setFreeText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [fields, setFields] = useState<EvolutionFields | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useVoiceInput();

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
    if (!text || isStreaming) return;

    setIsStreaming(true);
    setError(null);
    setFields(null);
    setStreamingText("");

    try {
      const res = await fetch("/api/generate-evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, freeText: text }),
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
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
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
          } catch { /* ignore trailing partial */ }
        }
      }

      const parsed = parseEvolutionMarkdown(fullText);
      if (Object.keys(parsed).length > 0) {
        setFields(parsed);
      } else {
        setFields({ Resultado: fullText });
      }
    } catch {
      setError("Error al generar evolución. Intentá nuevamente.");
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  function handleReset() {
    setFields(null);
    setFreeText("");
    setError(null);
    setStreamingText("");
    setEditingField(null);
    resetTranscript();
  }

  function handleStartEdit(key: string, value: string) {
    setEditingField(key);
    setEditValue(value);
  }

  function handleSaveEdit(key: string) {
    if (fields) {
      setFields({ ...fields, [key]: editValue });
    }
    setEditingField(null);
  }

  async function handleCopy() {
    if (!fields) return;
    const text = fieldsToText(fields);
    await navigator.clipboard.writeText(text);
    toast.success("Evolución copiada al portapapeles");
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function handleExportPDF() {
    if (!fields) return;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Evolución Clínica</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;max-width:700px;margin:40px auto;color:#1a1a1a;line-height:1.6;padding:0 20px}
h1{font-size:20px;border-bottom:2px solid #0d9488;padding-bottom:8px;color:#0d9488}
h2{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#0d9488;margin-top:20px;margin-bottom:4px}
p{margin:0 0 12px}
.meta{font-size:12px;color:#666;margin-bottom:24px}
.footer{margin-top:32px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#999}
@media print{body{margin:0;padding:20px}}
</style></head><body>
<h1>Evolución Clínica</h1>
<p class="meta">Generado por MediScribe · ${new Date().toLocaleDateString("es-AR")}</p>
${Object.entries(fields).map(([k, v]) => `<h2>${escapeHtml(k)}</h2><p>${escapeHtml(v)}</p>`).join("")}
<p class="footer">⚕️ Generado por IA como asistencia al profesional médico. El criterio clínico del médico prevalece siempre.</p>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    setTimeout(() => {
      w?.print();
      URL.revokeObjectURL(url);
    }, 500);
  }

  const showInput = !fields && !isStreaming;
  const showStreaming = isStreaming && streamingText;
  const showStreamingLoader = isStreaming && !streamingText;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generar evolución
          </CardTitle>
          {fields && (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="h-7 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                className="h-7 text-xs"
              >
                <FileDown className="h-3 w-3 mr-1" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-3">
        {showInput && (
          <>
            <div className="relative">
              <Textarea
                placeholder="Dictá o escribí la consulta en texto libre... Ej: 'Paciente consulta por dolor abdominal de 3 dias, localizado en FID, sin fiebre, Murphy negativo'"
                value={isListening ? freeText + " " + transcript : freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="min-h-[140px] pr-12 resize-none"
              />
              {isSupported && (
                <Button
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  className="absolute bottom-2 right-2 h-8 w-8"
                  onClick={handleToggleVoice}
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs text-red-500 font-medium">
                  Escuchando...
                </span>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!freeText.trim()}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Estructurar con IA
            </Button>
          </>
        )}

        {showStreamingLoader && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-sm text-muted-foreground">
              Generando evolución...
            </span>
          </div>
        )}

        {showStreaming && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{streamingText}</ReactMarkdown>
          </div>
        )}

        {fields && (
          <>
            <div className="space-y-3">
              {(
                FIELD_ORDER.filter((f) => fields[f]).length > 0
                  ? FIELD_ORDER.filter((f) => fields[f])
                  : Object.keys(fields)
              ).map((key) => {
                const value = fields[key];
                if (!value) return null;
                const isEditing = editingField === key;

                return (
                  <div
                    key={key}
                    className="group rounded-lg border border-transparent hover:border-white/10 hover:bg-white/[0.02] p-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {key}
                      </Badge>
                      {isEditing ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleSaveEdit(key)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleStartEdit(key, value)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-h-[60px] text-sm resize-none"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{value}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground border-t pt-2 mt-4">
              ⚕️ Generado por IA como asistencia al profesional médico. El
              criterio clínico del médico prevalece siempre.
            </p>

            <Button variant="outline" className="w-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Nueva evolución
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
