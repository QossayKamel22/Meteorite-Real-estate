import type { Metadata } from "next";
import { BarChart3, Clock } from "lucide-react";
import { getStatsList } from "@/lib/site-stats";
import AdminStatsForm from "@/components/AdminStatsForm";
import AdminSignOutButton from "@/components/AdminSignOutButton";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const fields = await getStatsList();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-brand-ink/45">
        Dashboard <span className="mx-1.5">/</span>{" "}
        <span className="text-brand-ink/70">Homepage Statistics</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Homepage Statistics
          </h1>
          <p className="mt-1 text-sm text-brand-ink/55">
            Edit the numbers shown across the site&apos;s stat sections.
          </p>
        </div>
        <AdminSignOutButton />
      </div>

      <div className="glass shimmer-border mt-8 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-3 rounded-xl bg-brand-paper p-4 text-sm leading-relaxed text-brand-ink/60">
          <BarChart3 size={16} className="mt-0.5 flex-none text-brand-gold" />
          <p>
            These four numbers appear on the Homepage, About Us, and Payment page stat sections.
            Changes save immediately and go live on the next page load — no rebuild or deploy
            needed.
          </p>
        </div>
        <div className="mt-6">
          <AdminStatsForm fields={fields} />
        </div>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-brand-ink/40">
        <Clock size={13} />
        Signed in as administrator — this session expires automatically after 8 hours.
      </p>
    </div>
  );
}
