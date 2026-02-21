import { NextRequest } from "next/server";
import { streamCompletion } from "@/lib/ai";
import { REFERRAL_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/patient-service";

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

  const token = req.cookies.get("ehr-token")?.value;
  const ehrUrl = req.cookies.get("ehr-url")?.value;
  const record = await getPatientById(patientId, token, ehrUrl);
  if (!record) {
    return new Response("Paciente no encontrado", { status: 404 });
  }

  const context = buildPatientContext(record);
  const messages = [
    {
      role: "user" as const,
      content: `Historia clínica completa del paciente:\n\n${context}\n\n---\n\nAnalizá la HC completa y sugerí las derivaciones a especialistas que serían pertinentes, ordenadas por urgencia.`,
    },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(
          REFERRAL_PROMPT,
          messages,
        )) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Referral stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Error al generar sugerencias de derivación" })}\n\n`,
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
