import type { RegisteredAppsMap } from "@/lib/registered-apps";

/** Prefer `redirect_url` query when its origin matches a configured app URL (values in the apps map). */
export function pickPostLoginRedirect(
  queryRedirect: string | null | undefined,
  apiRedirect: string,
  appsMap: RegisteredAppsMap,
): string {
  const q = queryRedirect?.trim();
  if (!q) return apiRedirect;

  const allowedOrigins = new Set<string>();
  for (const href of Object.values(appsMap)) {
    try {
      allowedOrigins.add(new URL(href).origin);
    } catch {
      /* skip invalid map entries */
    }
  }
  if (allowedOrigins.size === 0) return apiRedirect;

  try {
    const candidate = new URL(q);
    if (candidate.protocol !== "http:" && candidate.protocol !== "https:") return apiRedirect;
    if (!allowedOrigins.has(candidate.origin)) return apiRedirect;
    return q;
  } catch {
    return apiRedirect;
  }
}
