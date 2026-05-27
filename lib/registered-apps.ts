export type RegisteredAppsMap = Record<string, string>;

export function parseRegisteredAppsJson(raw: string | undefined): RegisteredAppsMap {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const out: RegisteredAppsMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

export function getRegisteredAppsFromEnv(): RegisteredAppsMap {
  return parseRegisteredAppsJson(process.env.NEXT_PUBLIC_REGISTERED_APPS_JSON);
}

export function defaultAppIdFromMap(map: RegisteredAppsMap): string {
  const keys = Object.keys(map);
  const playerApps = keys.filter((k) => k !== "ADMIN_APP");

  const fromEnv = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_APP?.trim();
  if (fromEnv && fromEnv in map) return fromEnv;

  if (playerApps.length === 1) return playerApps[0]!;

  if (playerApps.length > 1) {
    return playerApps.sort((a, b) => a.localeCompare(b))[0]!;
  }

  if ("ADMIN_APP" in map) return "ADMIN_APP";
  return keys[0] ?? "ADMIN_APP";
}

/**
 * App label comes from ?redirect-to= (or typo alias redirecto-to=); falls back to map default.
 */
export function resolveDisplayedAppId(
  queryValue: string | null | undefined,
  map: RegisteredAppsMap,
): string {
  const q = queryValue?.trim();
  if (q) return q;
  return defaultAppIdFromMap(map);
}

export function supportMailtoHref(email: string): string {
  const trimmed = email.trim();
  const subject = encodeURIComponent("ArcadeCore — Support request");
  return `mailto:${trimmed}?subject=${subject}`;
}
