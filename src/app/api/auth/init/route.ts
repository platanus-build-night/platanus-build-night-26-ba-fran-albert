import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token || typeof token !== "string" || token.length > 4096) {
    return NextResponse.json({ error: "Token invalido" }, { status: 400 });
  }

  const isEhr = process.env.DATA_SOURCE === "ehr";
  const mode = isEhr ? "ehr" : "mock";

  const response = NextResponse.json({ mode });
  response.cookies.set("ehr-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return response;
}
