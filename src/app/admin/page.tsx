import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { getStatsList } from "@/lib/site-stats";
import AdminStatsForm from "@/components/AdminStatsForm";
import AdminSignOutButton from "@/components/AdminSignOutButton";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const fields = await getStatsList();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <LayoutDashboard size={18} strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-heading">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-brand-ink/55">Homepage statistics</p>
          </div>
        </div>
        <AdminSignOutButton />
      </div>

      <div className="glass shimmer-border mt-8 rounded-3xl p-7 sm:p-9">
        <p className="text-sm leading-relaxed text-brand-ink/60">
          These four numbers appear on the homepage, About Us, and Payment page stat sections.
          Changes save immediately and go live on the next page load — no rebuild or deploy
          needed.
        </p>
        <div className="mt-6">
          <AdminStatsForm fields={fields} />
        </div>
      </div>

      <p className="mt-6 text-xs text-brand-ink/40">
        Signed in as administrator. This session expires automatically after 8 hours.
      </p>
    </div>
  );
}
