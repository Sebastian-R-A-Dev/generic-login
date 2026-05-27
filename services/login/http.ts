import axios from "axios";

/** ArcadeCore backend origin (no trailing slash). Login hits POST /api/v1/auth/login */
export function getArcadecoreApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_ARCADECORE_API_BASE_URL?.trim() ?? "";
}

export const loginHttp = axios.create({
  baseURL: getArcadecoreApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
  withCredentials: true,
});
