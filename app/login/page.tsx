import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-200"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-400/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-white/50 blur-2xl"
        aria-hidden
      />

      <div className="glass-card relative z-10 w-full max-w-md p-8 sm:p-10">
        <LoginForm />
      </div>
    </main>
  );
}
