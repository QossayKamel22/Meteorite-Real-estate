"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * A brief, full-screen overlay shown while a sign-in/register/sign-out
 * action is actually in flight (not during the initial silent auth check on
 * page load — that's a separate, quieter loading state). Mounted once at
 * the root so it appears above every page, regardless of where the action
 * was triggered from (header menu, /login, /register, admin sign-out...).
 */
export default function AuthLoadingOverlay() {
  const { actionLoading } = useAuth();

  if (!actionLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/40 backdrop-blur-sm"
    >
      <div className="glass shimmer-border flex items-center gap-3 rounded-2xl px-6 py-4">
        <span
          aria-hidden="true"
          className="h-5 w-5 flex-none animate-spin rounded-full border-2 border-brand-gold border-t-transparent"
        />
        <span className="text-sm font-medium text-heading">Please wait…</span>
      </div>
    </div>
  );
}
