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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

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
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* LEFT COLUMN: Input / Context */}
      <AnimatePresence mode="wait">
        {(showInput || showStreaming) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, flex: showStreaming ? 1 : 2 }}
            exit={{ opacity: 0, width: 0, overflow: "hidden" }}
            className={`flex flex-col h-full bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden ${showStreaming ? "md:w-1/2" : "w-full"}`}
          >
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Mic className="h-4 w-4 text-primary" />
                </div>
                <span>Nota de Voz / Texto Libre</span>
              </div>
              {isSupported && (
                <Badge variant={isListening ? "destructive" : "secondary"} className={cn("px-3 py-1", isListening && "animate-pulse")}>
                  {isListening ? "Escuchando..." : "Micrófono Listo"}
                </Badge>
              )}
            </div>

            <div className="flex-1 relative bg-card">
              <Textarea
                placeholder="Comenzá a hablar o escribí aquí la consulta...
Ej: 'Paciente de 45 años consulta por dolor en fosa iliaca derecha de 12 horas de evolución, Murphy negativo, sin fiebre...'"
                value={isListening ? freeText + " " + transcript : freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 p-8 text-lg leading-relaxed bg-transparent placeholder:text-muted-foreground/30"
              />
              
              {/* Floating Action Bar */}
              <div className="absolute bottom-8 right-8 flex gap-4">
                 {isSupported && (
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "secondary"}
                    className={cn(
                      "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
                      isListening ? "scale-110 ring-8 ring-red-500/10" : "hover:scale-105 bg-background border-border/50"
                    )}
                    onClick={handleToggleVoice}
                  >
                    {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  </Button>
                 )}
                 
                 <Button
                  size="lg"
                  className="h-16 px-10 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-all duration-300 text-base font-semibold"
                  onClick={handleGenerate}
                  disabled={!freeText.trim() || isListening}
                >
                  {isStreaming ? (
                    <Sparkles className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <span>Estructurar con IA</span>
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT COLUMN: Output */}
      <AnimatePresence>
        {(showStreaming || fields) && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col h-full bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden"
          >
             <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                   <FileText className="h-4 w-4 text-primary" />
                </div>
                <span>Evolución Clínica Estructurada</span>
              </div>
              <div className="flex gap-2">
                 {fields && (
                   <>
                     <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-muted" onClick={handleCopy} title="Copiar">
                       <Copy className="h-4 w-4" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-muted" onClick={handleExportPDF} title="Exportar PDF">
                       <FileDown className="h-4 w-4" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={handleReset} title="Nueva Consulta">
                       <RotateCcw className="h-4 w-4" />
                     </Button>
                   </>
                 )}
              </div>
            </div>

            <ScrollArea className="flex-1 bg-card">
               <div className="p-8">
                 {isStreaming ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 text-primary font-semibold text-sm animate-pulse">
                        <Sparkles className="h-5 w-5 animate-spin" />
                        <span>Analizando y extrayendo datos clínicos...</span>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none opacity-50 bg-muted/10 p-6 rounded-xl border border-dashed">
                         <ReactMarkdown>{streamingText}</ReactMarkdown>
                      </div>
                   </div>
                 ) : fields ? (
                   <div className="space-y-8 max-w-3xl mx-auto">
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
                            className="group relative pl-6 border-l-2 border-primary/10 hover:border-primary transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                                {key}
                              </h3>
                              {!isEditing && (
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                  onClick={() => handleStartEdit(key, value)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                            
                            {isEditing ? (
                              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-primary/20 animate-in zoom-in-95 duration-200">
                                <Textarea 
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="min-h-[100px] text-base bg-background border-border/50 focus-visible:ring-primary/20"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                   <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>Cancelar</Button>
                                   <Button size="sm" onClick={() => handleSaveEdit(key)} className="h-8 px-4">
                                      <Check className="h-4 w-4 mr-2" />
                                      Guardar
                                   </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap pl-1 font-medium">
                                {value}
                              </p>
                            )}
                          </motion.div>
                        );
                      })}
                      
                      <Separator className="my-12 opacity-50" />
                      
                      <div className="flex flex-col items-center justify-center gap-3 opacity-30 pb-10">
                         <div className="h-10 w-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                            <Stethoscope className="h-5 w-5" />
                         </div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Documento Finalizado</span>
                      </div>
                   </div>
                 ) : null}
               </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
