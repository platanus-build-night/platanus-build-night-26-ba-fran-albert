"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  Plus,
  Trash2,
  Copy,
  FileDown,
  Pill,
  Sparkles,
  User,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import type { PatientRecord } from "@/lib/mock-data";

interface PrescriptionItem {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface Props {
  record: PatientRecord;
}

export function PrescriptionPanel({ record }: Props) {
  const initialItems = useMemo(() => {
    return record.medications
      .filter((m) => m.status === "ACTIVE")
      .map((m, i) => ({
        id: `existing-${i}`,
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        duration: "Continuo",
      }));
  }, [record.medications]);

  const [items, setItems] = useState<PrescriptionItem[]>(initialItems);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const doctorName = "Dr. Martín Pérez";
  const doctorMatricula = "MP 12345/6";

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        dose: "",
        frequency: "",
        duration: "",
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateItem(
    id: string,
    field: keyof Omit<PrescriptionItem, "id">,
    value: string
  ) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function buildPlainText(): string {
    const date = new Date().toLocaleDateString("es-AR");
    let text = `RECETA MEDICA\n`;
    text += `Fecha: ${date}\n\n`;
    text += `Paciente: ${record.patient.firstName} ${record.patient.lastName}\n`;
    text += `DNI: ${record.patient.documentNumber}\n`;
    text += `Obra social: ${record.patient.healthInsurance}\n\n`;
    text += `Médico: ${doctorName}\n`;
    text += `Matrícula: ${doctorMatricula}\n\n`;
    text += `PRESCRIPCIÓN:\n`;
    text += `${"=".repeat(40)}\n\n`;

    items.forEach((item, i) => {
      if (!item.name) return;
      text += `${i + 1}. ${item.name}\n`;
      text += `   Dosis: ${item.dose}\n`;
      text += `   Frecuencia: ${item.frequency}\n`;
      if (item.duration) text += `   Duración: ${item.duration}\n`;
      text += "\n";
    });

    if (specialInstructions.trim()) {
      text += `INDICACIONES ESPECIALES:\n`;
      text += `${specialInstructions}\n\n`;
    }

    text += `${"=".repeat(40)}\n`;
    text += `Válido por 30 días desde la fecha de emisión.\n`;
    return text;
  }

  async function handleCopy() {
    const text = buildPlainText();
    await navigator.clipboard.writeText(text);
    toast.success("Receta copiada al portapapeles");
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function handleExportPDF() {
    const date = new Date().toLocaleDateString("es-AR");
    const itemsHtml = items
      .filter((item) => item.name)
      .map(
        (item, i) => `
        <div style="margin-bottom:12px;padding:8px 0;border-bottom:1px solid #eee">
          <p style="margin:0;font-weight:600">${i + 1}. ${escapeHtml(item.name)}</p>
          <p style="margin:2px 0 0 16px;color:#555">
            Dosis: ${escapeHtml(item.dose)} | Frecuencia: ${escapeHtml(item.frequency)}${item.duration ? ` | Duración: ${escapeHtml(item.duration)}` : ""}
          </p>
        </div>`
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receta Médica</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;color:#1a1a1a;line-height:1.6;padding:0 20px}h1{font-size:22px;text-align:center;border-bottom:3px solid #0d9488;padding-bottom:8px;color:#0d9488;margin-bottom:4px}.subtitle{text-align:center;font-size:12px;color:#666;margin-bottom:24px}.section{margin-bottom:16px}.section h2{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#0d9488;margin:0 0 6px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:14px}.info-grid p{margin:0}.label{color:#666;font-size:12px}.items{margin-top:16px}.special{background:#f9f9f9;border-radius:6px;padding:12px;margin-top:12px;font-size:13px}.footer{margin-top:32px;padding-top:12px;border-top:2px solid #0d9488;text-align:center;font-size:11px;color:#666}.signature{margin-top:48px;text-align:center;border-top:1px solid #333;width:200px;margin-left:auto;margin-right:auto;padding-top:8px;font-size:13px}@media print{body{margin:0;padding:20px}}</style></head><body><h1>Receta Médica</h1><p class="subtitle">Fecha: ${date}</p><div class="section"><h2>Datos del Paciente</h2><div class="info-grid"><p><span class="label">Nombre:</span> ${escapeHtml(record.patient.firstName)} ${escapeHtml(record.patient.lastName)}</p><p><span class="label">DNI:</span> ${escapeHtml(record.patient.documentNumber)}</p><p><span class="label">Edad:</span> ${record.patient.age} años</p><p><span class="label">Obra social:</span> ${escapeHtml(record.patient.healthInsurance)}</p></div></div><div class="section"><h2>Médico</h2><div class="info-grid"><p><span class="label">Nombre:</span> ${escapeHtml(doctorName)}</p><p><span class="label">Matrícula:</span> ${escapeHtml(doctorMatricula)}</p></div></div><div class="section"><h2>Prescripción</h2><div class="items">${itemsHtml}</div></div>${specialInstructions.trim() ? `<div class="section"><h2>Indicaciones Especiales</h2><div class="special">${escapeHtml(specialInstructions)}</div></div>` : ""}<div class="signature"><p>${escapeHtml(doctorName)}<br/>${escapeHtml(doctorMatricula)}</p></div><div class="footer"><p>Válido por 30 días desde la fecha de emisión.</p><p>Generado por MediScribe</p></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    setTimeout(() => { w?.print(); URL.revokeObjectURL(url); }, 500);
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden border-border/50 shadow-sm bg-card">
      <CardHeader className="pb-3 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            Generador de Receta Digital
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copiar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportPDF}
              className="h-8 text-xs"
            >
              <FileDown className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 gap-4 pt-4 bg-card">
        {/* Receta Header Info */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <Stethoscope className="h-3 w-3" />
               <span className="font-semibold text-foreground">{doctorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <span className="opacity-50">MAT:</span>
               <span className="font-medium text-foreground">{doctorMatricula}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="opacity-50">Fecha:</span>
             <span className="font-medium text-foreground">{new Date().toLocaleDateString("es-AR")}</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 pb-6 px-1">
            {/* Medication items */}
            <div className="grid grid-cols-1 gap-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/50 p-4 space-y-3 bg-muted/[0.03] hover:bg-muted/[0.08] transition-colors relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medicamento</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Nombre</label>
                       <Input
                        placeholder="Amoxicilina..."
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="bg-background border-border/50 h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Dosis</label>
                       <Input
                        placeholder="500mg..."
                        value={item.dose}
                        onChange={(e) => updateItem(item.id, "dose", e.target.value)}
                        className="bg-background border-border/50 h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Frecuencia</label>
                       <Input
                        placeholder="Cada 8hs..."
                        value={item.frequency}
                        onChange={(e) => updateItem(item.id, "frequency", e.target.value)}
                        className="bg-background border-border/50 h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Duración</label>
                       <Input
                        placeholder="7 días..."
                        value={item.duration}
                        onChange={(e) => updateItem(item.id, "duration", e.target.value)}
                        className="bg-background border-border/50 h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add button */}
            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 text-primary font-medium"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar nuevo fármaco
            </Button>

            {/* Special instructions */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 px-1">
                 <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                 <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                   Indicaciones Especiales y Cuidados
                 </label>
              </div>
              <Textarea
                placeholder="Ej: Reposo por 48hs, dieta hiposódica, volver si presenta fiebre..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="min-h-[100px] resize-none bg-muted/20 border-border/50 focus-visible:ring-primary/20"
              />
            </div>

            {/* Footer note */}
            <div className="flex flex-col items-center gap-2 pt-8 opacity-40">
               <Sparkles className="h-5 w-5 text-primary" />
               <p className="text-[10px] text-center uppercase tracking-widest font-bold">
                 Válido por 30 días · Firma Digital MediScribe
               </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}