"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  FileDown, 
  Pencil, 
  Check, 
  ArrowRight,
  FileText,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Evolución Clínica</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;color:#1a1a1a;line-height:1.6;padding:0 20px}h1{font-size:20px;border-bottom:2px solid #0d9488;padding-bottom:8px;color:#0d9488}h2{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#0d9488;margin-top:20px;margin-bottom:4px}p{margin:0 0 12px}.meta{font-size:12px;color:#666;margin-bottom:24px}.footer{margin-top:32px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#999}@media print{body{margin:0;padding:20px}}</style></head><body><h1>Evolución Clínica</h1><p class="meta">Generado por MediScribe · ${new Date().toLocaleDateString("es-AR")} </p>${Object.entries(fields).map(([k, v]) => `<h2>${escapeHtml(k)}</h2><p>${escapeHtml(v)}</p>`).join("")}<p class="footer">⚕️ Generado por IA como asistencia al profesional médico.</p></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    setTimeout(() => { w?.print(); URL.revokeObjectURL(url); }, 500);
  }

  // Derived states
  const showInput = !fields && !isStreaming;
  const showStreaming = isStreaming;

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-1">
      {/* LEFT COLUMN: Input / Context */}
      <AnimatePresence mode="wait">
        {(showInput || showStreaming) && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, flex: showStreaming ? 1 : 2 }} // Shrink when streaming if needed, or keep full
            exit={{ opacity: 0, width: 0, overflow: "hidden" }}
            className={`flex flex-col h-full bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden ${showStreaming ? "md:w-1/2" : "w-full"}`}
          >
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                   <Mic className="h-4 w-4 text-primary" />
                </div>
                <span>Nota de Voz / Texto</span>
              </div>
              {isSupported && (
                <Badge variant={isListening ? "destructive" : "secondary"} className="animate-in fade-in">
                  {isListening ? "Grabando..." : "Listo"}
                </Badge>
              )}
            </div>

            <div className="flex-1 relative bg-card">
              <Textarea
                placeholder="Comenzá a hablar o escribí aquí...
Ej: 'Paciente de 45 años, consulta por cefalea intensa...'"
                value={isListening ? freeText + " " + transcript : freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 p-6 text-lg leading-relaxed bg-transparent"
              />
              
              {/* Floating Voice Button */}
              <div className="absolute bottom-6 right-6 flex gap-3">
                 {isSupported && (
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "secondary"}
                    className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${isListening ? "scale-110 ring-4 ring-red-500/20" : "hover:scale-105"}`}
                    onClick={handleToggleVoice}
                  >
                    {isListening ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>
                 )}
                 
                 <Button
                  size="lg"
                  className="h-14 px-8 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
                  onClick={handleGenerate}
                  disabled={!freeText.trim() || isListening}
                >
                  {isStreaming ? (
                    <Sparkles className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Generar</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT COLUMN: Output (Streaming or Final) */}
      <AnimatePresence>
        {(showStreaming || fields) && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col h-full bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"
          >
             <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                   <FileText className="h-4 w-4 text-primary" />
                </div>
                <span>Evolución Estructurada</span>
              </div>
              <div className="flex gap-2">
                 {fields && (
                   <>
                     <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopy} title="Copiar">
                       <Copy className="h-4 w-4" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleExportPDF} title="PDF">
                       <FileDown className="h-4 w-4" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleReset} title="Reiniciar">
                       <RotateCcw className="h-4 w-4" />
                     </Button>
                   </>
                 )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 bg-card/50">
               {isStreaming ? (
                 <div className="space-y-4 animate-pulse">
                    <div className="flex items-center gap-2 text-primary font-medium text-sm">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Analizando y estructurando...</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                       <ReactMarkdown>{streamingText}</ReactMarkdown>
                    </div>
                 </div>
               ) : fields ? (
                 <div className="space-y-6 max-w-2xl mx-auto">
                    {(FIELD_ORDER.filter((f) => fields[f]).length > 0
                      ? FIELD_ORDER.filter((f) => fields[f])
                      : Object.keys(fields)
                    ).map((key) => {
                      const value = fields[key];
                      const isEditing = editingField === key;
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={key}
                          className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                              {key}
                            </h3>
                            {!isEditing && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleStartEdit(key, value)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Textarea 
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-h-[80px] text-sm"
                                autoFocus
                              />
                              <Button size="icon" onClick={() => handleSaveEdit(key)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                              {value}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                    
                    <Separator className="my-8" />
                    
                    <div className="flex items-center justify-center gap-2 opacity-50">
                       <Stethoscope className="h-4 w-4" />
                       <span className="text-xs font-medium">Fin de la evolución</span>
                    </div>
                 </div>
               ) : null}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}