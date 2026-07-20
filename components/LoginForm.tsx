"use client";

import { MandatoryPasswordChange } from "@/components/MandatoryPasswordChange";
import {
  getLoginErrorMessage,
  isLoginRateLimited,
  loginWithEmergencyCode,
  loginWithRedirect,
} from "@/services/login/login.service";
import { goAfterLogin } from "@/services/login/navigate";
import { pickPostLoginRedirect } from "@/lib/post-login-redirect";
import type { LoginSuccessPayload } from "@/lib/login-response";
import {
  getRegisteredAppsFromEnv,
  resolveDisplayedAppId,
  supportMailtoHref,
} from "@/lib/registered-apps";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconSupport({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md space-y-6 px-1 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200/80" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-7 w-48 rounded-lg bg-slate-200/80" />
          <div className="h-4 w-64 rounded bg-slate-200/60" />
        </div>
      </div>
      <div className="h-24 rounded-xl bg-slate-200/50" />
      <div className="h-24 rounded-xl bg-slate-200/50" />
      <div className="h-12 rounded-xl bg-slate-200/70" />
    </div>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emergencyCode, setEmergencyCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [postLogin, setPostLogin] = useState<LoginSuccessPayload | null>(null);

  const appsMap = getRegisteredAppsFromEnv();
  const queryApp =
    searchParams.get("redirect-to")?.trim() ||
    searchParams.get("redirecto-to")?.trim() ||
    null;
  const redirectUrlFromQuery = searchParams.get("redirect_url")?.trim() || null;
  const displayedAppId = resolveDisplayedAppId(queryApp, appsMap);
  const isAdminApp = displayedAppId === "ADMIN_APP";

  const subtitle = isAdminApp
    ? emergencyMode
      ? "Enter your email and emergency security code"
      : "Sign in to access your dashboard"
    : "Sign in to your app";

  const registerHref = useMemo(() => {
    const p = new URLSearchParams();
    if (queryApp) p.set("redirect-to", queryApp);
    if (redirectUrlFromQuery) p.set("redirect_url", redirectUrlFromQuery);
    const q = p.toString();
    return q ? `/register?${q}` : "/register";
  }, [queryApp, redirectUrlFromQuery]);

  async function finishLogin(result: LoginSuccessPayload) {
    if (result.pendingPasswordChange) {
      setPostLogin(result);
      return;
    }
    const target = pickPostLoginRedirect(redirectUrlFromQuery, result.redirectUrl, appsMap);
    goAfterLogin(router, target);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }

    if (emergencyMode) {
      if (!emergencyCode.trim()) {
        setError("Enter the emergency security code.");
        return;
      }
      setLoading(true);
      try {
        const result = await loginWithEmergencyCode({
          email: email.trim(),
          emergency_code: emergencyCode.trim(),
        });
        await finishLogin(result);
      } catch (err) {
        setError(getLoginErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError("Enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithRedirect({
        app_name: displayedAppId,
        email: email.trim(),
        password: password.trim(),
      });
      setRateLimited(false);
      await finishLogin(result);
    } catch (err) {
      if (isAdminApp && isLoginRateLimited(err)) {
        setRateLimited(true);
      }
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "support@example.com";
  const supportHref = supportMailtoHref(supportEmail);

  if (postLogin?.pendingPasswordChange) {
    return (
      <MandatoryPasswordChange
        accessToken={postLogin.accessToken}
        pending={postLogin.pendingPasswordChange}
        onComplete={() => {
          const target = pickPostLoginRedirect(
            redirectUrlFromQuery,
            postLogin.redirectUrl,
            appsMap,
          );
          goAfterLogin(router, target);
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-6 px-1">
      <div className="flex items-start gap-3">
        <LogoMark />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">ArcadeCore Access</h1>
          <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
            Email
          </label>
          <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
            <IconUser className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {emergencyMode ? (
          <div>
            <label htmlFor="emergency_code" className="mb-1.5 block text-sm font-medium text-slate-800">
              Código de seguridad
            </label>
            <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
              <IconKey className="h-5 w-5 shrink-0 text-slate-500" />
              <input
                id="emergency_code"
                name="emergency_code"
                type="text"
                autoComplete="off"
                placeholder="Emergency security code"
                value={emergencyCode}
                onChange={(e) => setEmergencyCode(e.target.value)}
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-800">
              Password
            </label>
            <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
              <IconLock className="h-5 w-5 shrink-0 text-slate-500" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-portal-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portal-blue"
              >
                <span className="hidden sm:inline">view</span>
                {showPassword ? (
                  <IconEyeOff className="h-5 w-5" aria-hidden />
                ) : (
                  <IconEye className="h-5 w-5" aria-hidden />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#1A80F8] py-3 text-sm font-semibold text-white shadow-portal-glow transition hover:scale-[1.01] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A80F8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Continue"}
      </button>

      {isAdminApp && rateLimited && !emergencyMode ? (
        <p className="text-center text-sm text-slate-600">
          <button
            type="button"
            onClick={() => {
              setEmergencyMode(true);
              setError(null);
            }}
            className="font-medium text-[#1A80F8] underline-offset-2 hover:underline"
          >
            Iniciar con código de seguridad
          </button>
        </p>
      ) : null}

      {isAdminApp && emergencyMode ? (
        <p className="text-center text-sm text-slate-600">
          <button
            type="button"
            onClick={() => {
              setEmergencyMode(false);
              setEmergencyCode("");
              setError(null);
            }}
            className="font-medium text-slate-600 underline-offset-2 hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </p>
      ) : null}

      {!isAdminApp ? (
        <p className="text-center text-sm text-slate-600">
          <Link
            href={registerHref}
            className="font-medium text-[#1A80F8] underline-offset-2 hover:underline"
          >
            ¿Aún no tienes cuenta?
          </Link>
        </p>
      ) : null}

      <div className="relative pt-2">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200/80" aria-hidden />
        <p className="relative mx-auto w-fit bg-white/40 px-3 text-center text-xs font-medium text-slate-500 backdrop-blur-sm">
          Directly to:
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-600 sm:text-xs">
        <div
          className="flex flex-col items-center gap-2 rounded-xl px-2 py-2 select-none"
          aria-label={`After a successful sign-in, redirection applies for app ${displayedAppId}`}
        >
          <span className="pointer-events-none flex h-12 w-full max-w-[4.5rem] items-center justify-center rounded-xl bg-[#1A80F8] text-white shadow-md shadow-blue-500/25">
            <IconGear className="h-6 w-6" aria-hidden />
          </span>
          <span className="pointer-events-none break-all">{displayedAppId}</span>
        </div>
        <a
          href={supportHref}
          className="group flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-white/30"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white/50 text-slate-700 shadow-sm transition group-hover:scale-105 group-hover:border-portal-blue/40 group-hover:text-portal-blue">
            <IconSupport className="h-5 w-5" />
          </span>
          <span className="normal-case">Support</span>
        </a>
      </div>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormContent />
    </Suspense>
  );
}
