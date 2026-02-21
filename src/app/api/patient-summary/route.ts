import { NextRequest } from "next/server";
import { streamCompletion } from "@/lib/ai";
import { PATIENT_SUMMARY_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  let patientId: string;
  try {
    const body = await req.json();
    patientId = body.patientId;
  } catch {
    return new Response("Body inválido", { status: 400 });
  }

  if (!patientId || typeof patientId !== "string") {
    return new Response("patientId requerido", { status: 400 });
  }

  const record = getPatientById(patientId);
  if (!record) {
    return new Response("Paciente no encontrado", { status: 404 });
  }

  const context = buildPatientContext(record);
  const messages = [
    {
      role: "user" as const,
      content: `Historia clínica completa del paciente:\n\n${context}\n\n---\n\nGenerá un resumen en lenguaje simple y accesible para que el propio paciente entienda su estado de salud. Recordá usar "vos" y ser empático.`,
    },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(
          PATIENT_SUMMARY_PROMPT,
          messages,
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Patient summary stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Error al generar el resumen para el paciente" })}\n\n`,
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
