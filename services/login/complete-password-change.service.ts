import { isAxiosError } from "axios";
import { loginHttp } from "./http";

export async function completePasswordChange(payload: {
  accessToken: string;
  eventId: number;
  newPassword: string;
}): Promise<void> {
  await loginHttp.post(
    "/api/v1/auth/complete-password-change",
    {
      event_id: payload.eventId,
      new_password: payload.newPassword,
    },
    {
      headers: { Authorization: `Bearer ${payload.accessToken}` },
    },
  );
}

export function getPasswordChangeErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data;
    if (body && typeof body === "object") {
      const nested = (body as { error?: { message?: unknown } }).error;
      const nestedMsg = nested && typeof nested.message === "string" ? nested.message.trim() : "";
      if (nestedMsg) return nestedMsg;
    }
    return err.message || "Could not update password.";
  }
  if (err instanceof Error) return err.message;
  return "Could not update password.";
}
