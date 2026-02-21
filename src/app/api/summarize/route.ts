import { NextRequest, NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai";
import { SUMMARIZE_PROMPT } from "@/lib/prompts";
import { getPatientById, buildPatientContext } from "@/lib/patient-service";

export async function POST(req: NextRequest) {
  const { patientId } = await req.json();

  const token = req.cookies.get("ehr-token")?.value;
  const record = await getPatientById(patientId, token);
  if (!record) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  const context = buildPatientContext(record);
  const summary = await generateCompletion(
    SUMMARIZE_PROMPT,
    `Resumí la siguiente historia clínica:\n\n${context}`,
  );

  return NextResponse.json({ summary });
}
