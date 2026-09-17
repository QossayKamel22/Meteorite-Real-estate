"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const { continueAsGuest } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");

    if (!isLogin && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    // No authentication backend is connected in this deployment. Account
    // creation and sign-in require a real provider (e.g. Supabase Auth) —
    // see the implementation report for what's needed to go live.
    setNotice(
      "Account sign-in isn't connected yet in this deployment — no backend is configured, so we never fake a successful login. Continue as a guest to browse and save properties in the meantime."
    );
  }

  function handleGuest() {
    continueAsGuest();
    router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-brand-navy">
        {isLogin ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-brand-ink/60">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-brand-navy hover:text-brand-gold"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
              className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-navy"
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
            className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-navy"
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
              className="w-full rounded-xl border border-brand-line px-4 py-3 pr-12 text-[15px] outline-none focus:border-brand-navy"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-brand-ink/50 hover:text-brand-navy"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {isLogin && (
            <div className="mt-2 text-right">
              <Link href="/contact-us" className="text-xs font-medium text-brand-ink/50 hover:text-brand-navy">
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-xl bg-brand-paper p-4 text-sm leading-relaxed text-brand-ink/70">
            {notice}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-brand-navy px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-xs text-brand-ink/40">
        <span className="h-px flex-1 bg-brand-line" />
        or
        <span className="h-px flex-1 bg-brand-line" />
      </div>

      <button
        type="button"
        onClick={handleGuest}
        className="mt-6 w-full rounded-full border border-brand-line px-6 py-3.5 text-[15px] font-semibold text-brand-navy transition-colors hover:bg-brand-paper"
      >
        Continue as guest
      </button>
      <p className="mt-2 text-center text-xs text-brand-ink/45">
        Browse properties and save favorites on this device without an account.
      </p>
    </div>
  );
}
