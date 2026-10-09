"use client";

import Link from "next/link";
import { useEffect } from "react";

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
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-heading">{title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/60">{message}</p>
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
