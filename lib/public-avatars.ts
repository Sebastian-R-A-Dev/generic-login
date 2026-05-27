function getArcadecoreApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_ARCADECORE_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
}

export type PublicAvatar = {
  id: number;
  public_url: string;
  display_name: string;
};

export async function fetchPublicAvatars(limit = 24): Promise<PublicAvatar[]> {
  const base = getArcadecoreApiBaseUrl();
  if (!base) return [];
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${base}/api/v1/avatars?${params}`, {
    headers: { Accept: "application/json" },
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok || !json || typeof json !== "object") return [];
  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  const out: PublicAvatar[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (
      typeof r.id === "number" &&
      typeof r.public_url === "string" &&
      typeof r.display_name === "string"
    ) {
      out.push({ id: r.id, public_url: r.public_url, display_name: r.display_name });
    }
  }
  return out;
}
