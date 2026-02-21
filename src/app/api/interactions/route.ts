import { NextRequest } from "next/server";
import { streamCompletion } from "@/lib/ai";
import { INTERACTIONS_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { patientId } = await req.json();

  const record = getPatientById(patientId);
  if (!record) {
    return new Response("Paciente no encontrado", { status: 404 });
  }

  const activeMeds = record.medications.filter((m) => m.status === "ACTIVE");

  if (activeMeds.length < 2) {
    const encoder = new TextEncoder();
    const msg = activeMeds.length === 0
      ? "No hay medicamentos activos para analizar."
      : "Se necesitan al menos 2 medicamentos activos para analizar interacciones.";
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: msg })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  const context = buildPatientContext(record);

  const medsText = activeMeds
    .map((m) => `- ${m.name} (${m.dose}, ${m.frequency})`)
    .join("\n");

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    {
      role: "user",
      content: `Contexto completo del paciente:\n${context}\n\n---\n\nMedicación activa a analizar:\n${medsText}\n\n---\n\nAnalizá todas las interacciones medicamentosas entre los medicamentos listados.`,
    },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(
          INTERACTIONS_PROMPT,
          messages,
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Interactions stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Error al analizar interacciones" })}\n\n`,
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
