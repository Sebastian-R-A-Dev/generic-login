"use client";

import {
  completePasswordChange,
  getPasswordChangeErrorMessage,
} from "@/services/login/complete-password-change.service";
import type { PendingPasswordChange } from "@/lib/login-response";
import { FormEvent, useState } from "react";

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      <div className="input-glass flex items-center gap-2 px-3 py-2.5 hover:border-slate-300/80">
        <IconLock className="h-5 w-5 shrink-0 text-slate-500" />
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-portal-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portal-blue"
        >
          <span className="hidden sm:inline">view</span>
          {show ? <IconEyeOff className="h-5 w-5" aria-hidden /> : <IconEye className="h-5 w-5" aria-hidden />}
          <span className="sr-only">{show ? "Hide password" : "Show password"}</span>
        </button>
      </div>
    </label>
  );
}

export function MandatoryPasswordChange({
  accessToken,
  pending,
  onComplete,
}: {
  accessToken: string;
  pending: PendingPasswordChange;
  onComplete: () => void;
}) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await completePasswordChange({
        accessToken,
        eventId: pending.eventId,
        newPassword: password,
      });
      onComplete();
    } catch (err) {
      setError(getPasswordChangeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 px-1">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          An administrator reset your password. Choose a new password to continue.
        </p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
        <PasswordInput
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm password"
          value={password2}
          onChange={setPassword2}
          show={showPassword2}
          onToggleShow={() => setShowPassword2((v) => !v)}
        />

        {error ? (
          <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#1A80F8] py-3 text-sm font-semibold text-white shadow-portal-glow transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
