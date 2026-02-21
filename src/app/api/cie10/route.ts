import { NextRequest } from "next/server";
import { streamCompletion } from "@/lib/ai";
import { CIE10_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/patient-service";

export async function POST(req: NextRequest) {
  const { patientId, diagnosticText } = await req.json();

  const token = req.cookies.get("ehr-token")?.value;
  const ehrUrl = req.cookies.get("ehr-url")?.value;
  const record = await getPatientById(patientId, token, ehrUrl);
  if (!record) {
    return new Response("Paciente no encontrado", { status: 404 });
  }

  const context = buildPatientContext(record);
  const additionalContext = diagnosticText
    ? `\n\nContexto diagnóstico adicional proporcionado por el médico:\n${diagnosticText}`
    : "";

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    {
      role: "user",
      content: `Contexto completo del paciente:\n${context}${additionalContext}\n\n---\n\nSugerí los códigos CIE-10 más apropiados para este paciente basándote en toda la información disponible.`,
    },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(
          CIE10_PROMPT,
          messages,
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("CIE-10 stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Error al sugerir códigos CIE-10" })}\n\n`,
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
