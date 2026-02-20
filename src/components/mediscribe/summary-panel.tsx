"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Props {
  patientId: string;
}

export function SummaryPanel({ patientId }: Props) {
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
        body: JSON.stringify({ patientId }),
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resumen de HC
          </CardTitle>
          <div className="flex gap-1.5">
            {summary && (
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
            <Button size="sm" onClick={handleSummarize} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Analizando...
                </>
              ) : (
                "Generar resumen"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {!summary && !loading && !error && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Presioná &quot;Generar resumen&quot; para obtener un resumen de la
            historia clínica del paciente generado por IA.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        )}
        {summary && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
