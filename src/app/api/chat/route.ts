import { NextRequest } from "next/server";
import { streamCompletion } from "@/lib/ai";
import { CHAT_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/patient-service";

export async function POST(req: NextRequest) {
  const { patientId, message, history = [] } = await req.json();

  const token = req.cookies.get("ehr-token")?.value;
  const record = await getPatientById(patientId, token);
  if (!record) {
    return new Response("Paciente no encontrado", { status: 404 });
  }

  const context = buildPatientContext(record);
  const messages = [
    {
      role: "user" as const,
      content: `Contexto completo de la historia clínica del paciente:\n\n${context}\n\n---\n\nEl médico te consulta lo siguiente:`,
    },
    { role: "assistant" as const, content: "Entendido, tengo el contexto completo de la HC del paciente. ¿En qué puedo ayudarte?" },
    ...history,
    { role: "user" as const, content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(CHAT_PROMPT, messages)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Error al procesar la consulta" })}\n\n`,
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
