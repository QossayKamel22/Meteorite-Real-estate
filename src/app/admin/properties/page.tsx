import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { getProperties } from "@/lib/properties-data";
import AdminPropertiesPanel from "@/components/AdminPropertiesPanel";

export const metadata: Metadata = { title: "Properties · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getProperties({ includeHidden: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <Building2 size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Properties</h1>
          <p className="text-sm text-brand-ink/55">
            Shown on the For Sale and For Rent pages. Seeded from the company&apos;s real,
            currently-live Bayut listings — add, edit, hide, or remove as inventory changes.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminPropertiesPanel properties={properties} />
      </div>
    </div>
  );
}
