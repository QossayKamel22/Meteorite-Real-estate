// Instant skeleton while an admin page fetches its data (admin pages are rendered
// on demand), so navigation feels immediate instead of freezing on the old page.
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-brand-ink/10" />
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-brand-ink/10" />
          <div className="h-3 w-64 rounded bg-brand-ink/5" />
        </div>
      </div>
      <div className="mt-6 space-y-4 rounded-3xl bg-brand-ink/[0.04] p-6 sm:p-8">
        <div className="h-3 w-32 rounded bg-brand-ink/10" />
        <div className="h-10 w-full rounded-lg bg-brand-ink/5" />
        <div className="h-10 w-full rounded-lg bg-brand-ink/5" />
        <div className="h-24 w-full rounded-lg bg-brand-ink/5" />
      </div>
      <div className="mt-6 h-48 rounded-3xl bg-brand-ink/[0.04]" />
    </div>
  );
}
