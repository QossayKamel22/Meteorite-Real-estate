"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

const RETRY_KEY = "meteorite:auto-retry";
const RETRY_WINDOW_MS = 15_000;

/** True once per 15 seconds: a failed page load is retried silently one time before the visitor ever sees an error. */
function claimAutoRetry(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RETRY_KEY) ?? 0);
    if (Date.now() - last < RETRY_WINDOW_MS) return false;
    sessionStorage.setItem(RETRY_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

/**
 * Friendly recovery screen used by the route error boundaries. A thrown error
 * (for example Firestore being briefly unreachable) shows this instead of a
 * blank page, with a one-click retry that re-runs the render.
 */
export default function ErrorPanel({
  error,
  reset,
  title = "Something went wrong",
  message = "That didn't load properly. This is usually temporary — please try again.",
  homeHref = "/",
  homeLabel = "Back to home",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  const router = useRouter();
  // A hiccup while moving between pages (a cold start, a deploy, a brief Firestore blip) almost always
  // succeeds on the second try, so retry once on our own and only show the message if that fails too.
  const [retrying] = useState(claimAutoRetry);

  useEffect(() => {
    console.error(error);
    if (!retrying) return;
    const t = window.setTimeout(() => {
      startTransition(() => {
        router.refresh();
        reset();
      });
    }, 350);
    return () => window.clearTimeout(t);
  }, [error, retrying, reset, router]);

  if (retrying) {
    return (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center px-6 py-20" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-heading">{title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/70">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Try again
        </button>
        <Link
          prefetch={false}
          href={homeHref}
          className="rounded-full border border-brand-line px-6 py-3 text-[15px] font-semibold text-heading transition-colors hover:border-brand-gold"
        >
          {homeLabel}
        </Link>
      </div>
      {error.digest && <p className="mt-8 text-[11px] text-brand-ink/35">Reference: {error.digest}</p>}
    </div>
  );
}
