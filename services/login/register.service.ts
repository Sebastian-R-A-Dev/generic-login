import { loginHttp } from "./http";
import { resolveRedirectUrl } from "./redirect-url";

export type RegisterCredentials = {
  app_name: string;
  email: string;
  password: string;
  nickname: string;
  avatar_image_id?: number;
};

export async function registerWithRedirect(
  credentials: RegisterCredentials,
): Promise<{ redirectUrl: string }> {
  const { data } = await loginHttp.post<unknown>("/api/v1/auth/register", credentials);
  const redirectUrl = resolveRedirectUrl(data);
  if (!redirectUrl) {
    throw new Error(
      "El registro fue correcto pero la API no devolvió redirect_url; revisa ArcadeCore.",
    );
  }
  return { redirectUrl };
}
