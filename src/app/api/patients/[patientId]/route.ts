import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/lib/patient-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  const { patientId } = await params;

  if (!patientId || patientId.length > 100 || !/^[\w-]+$/.test(patientId)) {
    return NextResponse.json({ error: "ID de paciente invalido" }, { status: 400 });
  }

  const token = req.cookies.get("ehr-token")?.value;
  const ehrUrl = req.cookies.get("ehr-url")?.value;
  const record = await getPatientById(patientId, token, ehrUrl);

  if (!record) {
    return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  }

  return NextResponse.json(record);
}
