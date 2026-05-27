"use client";

import { pickPostLoginRedirect } from "@/lib/post-login-redirect";
import {
  getRegisteredAppsFromEnv,
  resolveDisplayedAppId,
  supportMailtoHref,
} from "@/lib/registered-apps";
import { getLoginErrorMessage } from "@/services/login/login.service";
import { goAfterLogin } from "@/services/login/navigate";
import { fetchPublicAvatars, type PublicAvatar } from "@/lib/public-avatars";
import { displayInitials } from "@/lib/initials";
import {
  getPlayerNicknameError,
  sanitizePlayerNicknameInput,
} from "@/lib/player-nickname";
import { registerWithRedirect } from "@/services/login/register.service";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";

function IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LogoMark() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-500/30"
      aria-hidden
    >
      A
    </div>
  );
}

function RegisterFormFallback() {
  return (
    <div className="w-full max-w-md space-y-6 px-1 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200/80" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-7 w-48 rounded-lg bg-slate-200/80" />
          <div className="h-4 w-64 rounded bg-slate-200/60" />
        </div>
      </div>
      <div className="h-14 rounded-xl bg-slate-200/50" />
      <div className="h-14 rounded-xl bg-slate-200/50" />
      <div className="h-14 rounded-xl bg-slate-200/50" />
      <div className="h-14 rounded-xl bg-slate-200/50" />
      <div className="h-12 rounded-xl bg-slate-200/70" />
    </div>
  );
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [avatars, setAvatars] = useState<PublicAvatar[]>([]);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setAvatarsLoading(true);
      const list = await fetchPublicAvatars(24);
      setAvatars(list);
      setAvatarsLoading(false);
    })();
  }, []);

  const appsMap = getRegisteredAppsFromEnv();
  const queryApp =
    searchParams.get("redirect-to")?.trim() ||
    searchParams.get("redirecto-to")?.trim() ||
    null;
  const redirectUrlFromQuery = searchParams.get("redirect_url")?.trim() || null;
  const displayedAppId = resolveDisplayedAppId(queryApp, appsMap);

  const loginHref = useMemo(() => {
    const p = new URLSearchParams();
    if (queryApp) p.set("redirect-to", queryApp);
    if (redirectUrlFromQuery) p.set("redirect_url", redirectUrlFromQuery);
    const q = p.toString();
    return q ? `/login?${q}` : "/login";
  }, [queryApp, redirectUrlFromQuery]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password || !nickname.trim()) {
      setError("Completa correo, contraseña y nombre de perfil.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    const nicknameError = getPlayerNicknameError(nickname);
    if (nicknameError) {
      setError(nicknameError);
      return;
    }
    setLoading(true);
    try {
      const { redirectUrl } = await registerWithRedirect({
        app_name: displayedAppId,
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        ...(avatarId != null ? { avatar_image_id: avatarId } : {}),
      });
      const target = pickPostLoginRedirect(redirectUrlFromQuery, redirectUrl, appsMap);
      goAfterLogin(router, target);
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "support@example.com";
  const supportHref = supportMailtoHref(supportEmail);

  if (displayedAppId === "ADMIN_APP") {
    return (
      <div className="w-full max-w-md space-y-4 px-1 text-center">
        <p className="text-sm text-slate-700">
          El registro público no está disponible para la aplicación de administración.
        </p>
        <Link href={loginHref} className="text-sm font-semibold text-[#1A80F8] hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 px-1">
      <div className="flex items-start gap-3">
        <LogoMark />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Crear cuenta
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">Completa tus datos para registrarte.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-slate-800">
            Correo electrónico
          </label>
          <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
            <IconUser className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-nickname" className="mb-1.5 block text-sm font-medium text-slate-800">
            Nombre en perfil (nickname)
          </label>
          <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
            <IconUser className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              id="reg-nickname"
              name="nickname"
              type="text"
              autoComplete="nickname"
              placeholder="Cómo te verán otros jugadores"
              value={nickname}
              onChange={(e) => setNickname(sanitizePlayerNicknameInput(e.target.value))}
              maxLength={64}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Solo letras y números. No se permiten signos ni etiquetas como [GM].
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-800">Avatar (opcional)</p>
          <p className="mb-3 text-xs text-slate-500">
            Elige un avatar del catálogo o continúa sin uno; usaremos la inicial de tu nickname.
          </p>
          {avatarsLoading ? (
            <p className="text-xs text-slate-500">Cargando avatares…</p>
          ) : avatars.length === 0 ? (
            <p className="text-xs text-slate-500">No hay avatares disponibles por ahora.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAvatarId(null)}
                className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-sm font-bold transition ${
                  avatarId === null
                    ? "border-[#1A80F8] bg-[#1A80F8]/10 text-[#1A80F8]"
                    : "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300"
                }`}
                title="Usar inicial del nickname"
              >
                {nickname.trim() ? displayInitials(nickname.trim()) : "?"}
              </button>
              {avatars.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatarId(a.id)}
                  className={`h-14 w-14 overflow-hidden rounded-xl border-2 transition ${
                    avatarId === a.id
                      ? "border-[#1A80F8] shadow-md shadow-blue-500/30"
                      : "border-slate-200 opacity-90 hover:border-slate-300"
                  }`}
                  title={a.display_name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.public_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-slate-800">
            Contraseña
          </label>
          <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
            <IconLock className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password2" className="mb-1.5 block text-sm font-medium text-slate-800">
            Confirmar contraseña
          </label>
          <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
            <IconLock className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              id="reg-password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#1A80F8] py-3 text-sm font-semibold text-white shadow-portal-glow transition hover:scale-[1.01] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A80F8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creando cuenta…" : "Registrarme"}
      </button>

      <p className="text-center text-sm text-slate-600">
        <Link href={loginHref} className="font-medium text-[#1A80F8] hover:underline">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </p>

      <div className="pt-2 text-center">
        <a href={supportHref} className="text-xs text-slate-500 underline-offset-2 hover:underline">
          Soporte
        </a>
      </div>
    </form>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={<RegisterFormFallback />}>
      <RegisterFormContent />
    </Suspense>
  );
}
