"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.3 0-13.6 4.1-16.9 10.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.5-4.6 2.4-7.7 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.4 39.9 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C41.5 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    actionLoading,
    error: authError,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    // Read the target from the URL directly (rather than useSearchParams) so
    // this client component doesn't force the login page into dynamic
    // rendering just to read one query param.
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect");
    const isSafeLocalPath = Boolean(redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//"));
    router.push(isSafeLocalPath ? (redirectTo as string) : "/");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isLogin && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isLogin) {
      await signInWithEmail(email, password);
    } else {
      await registerWithEmail(name, email, password);
    }
  }

  function handleGuest() {
    router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-heading">
        {isLogin ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-brand-ink/60">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-heading hover:text-brand-gold"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={actionLoading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-brand-line bg-surface px-6 py-3.5 text-[15px] font-semibold text-heading transition-colors hover:bg-brand-paper disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="mt-6 flex items-center gap-3 text-xs text-brand-ink/40">
        <span className="h-px flex-1 bg-brand-line" />
        or
        <span className="h-px flex-1 bg-brand-line" />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-ink/70">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-ink/70">
            Email address
          </label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-ink/70">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              className="w-full rounded-xl border border-brand-line px-4 py-3 pr-12 text-[15px] outline-none focus:border-brand-gold"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-brand-ink/50 hover:text-heading"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {isLogin && (
            <div className="mt-2 text-right">
              <Link href="/contact-us" className="text-xs font-medium text-brand-ink/50 hover:text-heading">
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        {(error || authError) && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error || authError}
          </p>
        )}

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full rounded-full bg-brand-navy px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
        >
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGuest}
        className="mt-6 w-full rounded-full border border-brand-line px-6 py-3.5 text-[15px] font-semibold text-heading transition-colors hover:bg-brand-paper"
      >
        Continue as guest
      </button>
      <p className="mt-2 text-center text-xs text-brand-ink/45">
        Browse properties and save favorites on this device without an account.
      </p>
    </div>
  );
}
