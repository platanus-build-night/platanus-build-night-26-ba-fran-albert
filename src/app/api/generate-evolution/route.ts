import { NextRequest, NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai";
import { EVOLUTION_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/patient-service";

export async function POST(req: NextRequest) {
  const { patientId, freeText } = await req.json();

  if (!freeText?.trim()) {
    return NextResponse.json({ error: "Texto requerido" }, { status: 400 });
  }

  const token = req.cookies.get("ehr-token")?.value;
  const ehrUrl = req.cookies.get("ehr-url")?.value;
  const record = await getPatientById(patientId, token, ehrUrl);
  if (!record) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const context = buildPatientContext(record);
  const prompt = `Contexto del paciente:\n${context}\n\n---\n\nTexto libre del médico:\n${freeText}\n\nEstructurá esta consulta en formato de evolución. Respondé ÚNICAMENTE con JSON válido.`;

  const result = await generateCompletion(EVOLUTION_PROMPT, prompt);

  try {
    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const evolution = JSON.parse(cleaned);
    return NextResponse.json({ evolution });
  } catch {
    return NextResponse.json({ evolution: { raw: result } });
  }
}
