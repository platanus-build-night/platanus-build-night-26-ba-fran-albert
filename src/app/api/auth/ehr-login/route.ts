import { NextRequest, NextResponse } from "next/server";
import { EHR_COOKIE_OPTIONS, validateEhrUrl } from "@/lib/ehr-config";

interface LoginRequest {
  url: string;
  userName: string;
  password: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<LoginRequest>;
  const { url, userName, password } = body;

  if (!url || !userName || !password) {
    return NextResponse.json(
      { success: false, error: "URL, usuario y contraseña son requeridos" },
      { status: 400 },
    );
  }

  const baseUrl = validateEhrUrl(url);
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, error: "URL inválida. Debe ser una URL HTTP/HTTPS válida." },
      { status: 400 },
    );
  }

  try {
    const ehrRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
      signal: AbortSignal.timeout(15000),
    });

    if (!ehrRes.ok) {
      const errorText = await ehrRes.text().catch(() => "");
      console.error(`[ehr-login] EHR error: ${ehrRes.status} ${errorText}`);
      const status = [401, 403].includes(ehrRes.status) ? 401 : 502;
      return NextResponse.json(
        { success: false, error: `Error del servidor EHR (${ehrRes.status})` },
        { status },
      );
    }

    const data = await ehrRes.json();
    const token: string = data.token ?? data.accessToken ?? data.access_token ?? "";

    if (!token || token.length > 4096) {
      return NextResponse.json(
        { success: false, error: "No se recibió un token válido del servidor" },
        { status: 502 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        firstName: data.firstName ?? data.name ?? "",
        lastName: data.lastName ?? "",
        roles: data.roles ?? [],
      },
    });

    response.cookies.set("ehr-token", token, EHR_COOKIE_OPTIONS);
    response.cookies.set("ehr-url", baseUrl, EHR_COOKIE_OPTIONS);

    return response;
  } catch (err) {
    console.error("[ehr-login] Connection error:", err);
    return NextResponse.json(
      { success: false, error: "No se pudo conectar al servidor" },
      { status: 502 },
    );
  }
}

export async function DELETE() {
  const expiredOptions = { ...EHR_COOKIE_OPTIONS, maxAge: 0 };

  const response = NextResponse.json({ success: true });
  response.cookies.set("ehr-token", "", expiredOptions);
  response.cookies.set("ehr-url", "", expiredOptions);

  return response;
}
