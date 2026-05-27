import { extractRedirectUrlFromResponse } from "@/services/login/redirect-url";

export type PendingPasswordChange = {
  eventId: number;
  type: "password_reset_required";
};

export type LoginSuccessPayload = {
  redirectUrl: string;
  accessToken: string;
  pendingPasswordChange: PendingPasswordChange | null;
};

function readInnerData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === "object") return inner as Record<string, unknown>;
  return o;
}

export function parseLoginSuccessPayload(data: unknown): LoginSuccessPayload | null {
  const inner = readInnerData(data);
  if (!inner) return null;

  const redirectUrl = extractRedirectUrlFromResponse(data);
  const accessToken =
    typeof inner.access_token === "string" && inner.access_token.trim()
      ? inner.access_token.trim()
      : null;
  if (!redirectUrl || !accessToken) return null;

  let pendingPasswordChange: PendingPasswordChange | null = null;
  const pending = inner.pending_password_change;
  if (pending && typeof pending === "object") {
    const p = pending as Record<string, unknown>;
    if (
      typeof p.event_id === "number" &&
      p.type === "password_reset_required"
    ) {
      pendingPasswordChange = { eventId: p.event_id, type: "password_reset_required" };
    }
  }

  return { redirectUrl, accessToken, pendingPasswordChange };
}
