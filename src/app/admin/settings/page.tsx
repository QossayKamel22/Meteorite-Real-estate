import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { getFaqs, getViewingSettings } from "@/lib/site-settings";
import AdminSettingsPanel from "@/components/AdminSettingsPanel";

export const metadata: Metadata = { title: "Settings · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [faq, viewing] = await Promise.all([getFaqs(), getViewingSettings()]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"><Settings size={16} strokeWidth={1.75} /></span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Settings</h1>
          <p className="text-sm text-brand-ink/66">The questions shown on the listing and contact pages, and when viewings can be booked.</p>
        </div>
      </div>
      <div className="mt-6">
        <AdminSettingsPanel faq={faq} viewing={viewing} />
      </div>
    </div>
  );
}
