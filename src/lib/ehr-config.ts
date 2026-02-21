export const EHR_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 8,
  path: "/",
};

export function validateEhrUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (url.length > 2048) return null;
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch {
    return null;
  }
}
