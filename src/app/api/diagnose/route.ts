import { NextRequest } from "next/server";
import { streamCompletion } from "@/lib/ai";
import { DIAGNOSE_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { patientId, consultaActual } = await req.json();

  const record = getPatientById(patientId);
  if (!record) {
    return new Response("Paciente no encontrado", { status: 404 });
  }

  const context = buildPatientContext(record);
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    {
      role: "user",
      content: `Contexto completo del paciente:\n${context}\n\n---\n\n${consultaActual ? `Consulta actual del médico:\n${consultaActual}\n\n---\n\n` : ""}Generá el análisis de diagnósticos diferenciales basándote en la historia clínica y la consulta actual.`,
    },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(
          DIAGNOSE_PROMPT,
          messages,
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Diagnose stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Error al generar diagnóstico" })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
