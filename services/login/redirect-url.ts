function readString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export function extractRedirectUrlFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const direct = readString(o, [
    "redirectUrl",
    "redirect_url",
    "redirect_uri",
    "redirect",
    "returnUrl",
    "return_url",
  ]);
  if (direct) return direct;
  const inner = o.data;
  if (inner && typeof inner === "object") {
    return readString(inner as Record<string, unknown>, [
      "redirectUrl",
      "redirect_url",
      "redirect_uri",
      "redirect",
      "returnUrl",
      "return_url",
    ]);
  }
  return null;
}

export function resolveRedirectUrl(data: unknown): string | null {
  return extractRedirectUrlFromResponse(data);
}
