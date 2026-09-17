"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-brand-paper px-4">
      <div className="glass shimmer-border w-full max-w-sm rounded-3xl p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo-transparent.png"
            alt="Meteorite Real Estate"
            width={160}
            height={29}
            className="h-8 w-auto"
          />
          <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <Lock size={18} />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-heading">
            Administrator Sign-In
          </h1>
          <p className="mt-1 text-sm text-brand-ink/55">Authorized staff only</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-ink/70">
              Admin password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-brand-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
