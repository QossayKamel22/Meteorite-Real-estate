"use client";

import ErrorPanel from "@/components/ErrorPanel";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorPanel
      error={error}
      reset={reset}
      title="This admin page couldn't load"
      message="The data service didn't respond in time. Nothing was lost — try again in a moment."
      homeHref="/admin"
      homeLabel="Back to overview"
    />
  );
}
