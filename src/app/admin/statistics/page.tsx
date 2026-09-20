import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getStatsList } from "@/lib/site-stats";
import AdminStatsForm from "@/components/AdminStatsForm";

export const metadata: Metadata = { title: "Statistics · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminStatisticsPage() {
  const fields = await getStatsList({ includeHidden: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <BarChart3 size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Homepage Statistics</h1>
          <p className="text-sm text-brand-ink/55">
            Shown on the Homepage, About Us, and Payment page stat sections.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminStatsForm fields={fields} />
      </div>
    </div>
  );
}
