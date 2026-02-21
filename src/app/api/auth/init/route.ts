import { NextRequest, NextResponse } from "next/server";
import { EHR_COOKIE_OPTIONS, validateEhrUrl } from "@/lib/ehr-config";

export async function POST(req: NextRequest) {
  const { token, url } = await req.json();

  if (!token || typeof token !== "string" || token.length > 4096) {
    return NextResponse.json({ error: "Token invalido" }, { status: 400 });
  }

  let validatedUrl: string | null = null;
  if (url && typeof url === "string") {
    validatedUrl = validateEhrUrl(url);
  }

  const isEhr = !!validatedUrl || process.env.DATA_SOURCE === "ehr";
  const mode = isEhr ? "ehr" : "mock";

  const response = NextResponse.json({ mode });
  response.cookies.set("ehr-token", token, EHR_COOKIE_OPTIONS);

  if (validatedUrl) {
    response.cookies.set("ehr-url", validatedUrl, EHR_COOKIE_OPTIONS);
  }

  return response;
}
