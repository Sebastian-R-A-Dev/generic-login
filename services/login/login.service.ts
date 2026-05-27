import { isAxiosError } from "axios";
import { parseLoginSuccessPayload, type LoginSuccessPayload } from "@/lib/login-response";
import { loginHttp } from "./http";

export type LoginCredentials = {
  app_name: string;
  email: string;
  password: string;
};

export type LoginResult = LoginSuccessPayload;

export async function loginWithRedirect(credentials: LoginCredentials): Promise<LoginResult> {
  const { data } = await loginHttp.post<unknown>("/api/v1/auth/login", credentials);
  const parsed = parseLoginSuccessPayload(data);
  if (!parsed) {
    throw new Error(
      "Login succeeded but the API response was incomplete (expected redirect_url and access_token).",
    );
  }
  return parsed;
}

export function getLoginErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data;
    if (body && typeof body === "object") {
      const nested = (body as { error?: { message?: unknown } }).error;
      const nestedMsg = nested && typeof nested.message === "string" ? nested.message.trim() : "";
      if (nestedMsg) {
        if (nestedMsg.toLowerCase() === "invalid credentials") return "Credenciales inválidas.";
        return nestedMsg;
      }
      if ("message" in body) {
        const m = (body as { message?: unknown }).message;
        if (typeof m === "string" && m.trim()) return m;
      }
    }
    return err.message || "Login failed.";
  }
  if (err instanceof Error) return err.message;
  return "Login failed.";
}
