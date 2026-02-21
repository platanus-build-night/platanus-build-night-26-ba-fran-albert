import { NextRequest, NextResponse } from "next/server";
import { searchPatients } from "@/lib/patient-service";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json([]);
  }

  const token = req.cookies.get("ehr-token")?.value;
  const ehrUrl = req.cookies.get("ehr-url")?.value;
  const results = await searchPatients(query, token, ehrUrl);

  return NextResponse.json(results);
}
