import type { Metadata } from "next";
import { DatabaseBackup } from "lucide-react";
import AdminBackupPanel from "@/components/AdminBackupPanel";

export const metadata: Metadata = { title: "Backup · Admin" };
export const dynamic = "force-dynamic";

export default function AdminBackupPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"><DatabaseBackup size={16} strokeWidth={1.75} /></span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Backup</h1>
          <p className="text-sm text-brand-ink/66">A copy of everything you manage on the site: messages, listings, team, posts and settings.</p>
        </div>
      </div>
      <div className="mt-6"><AdminBackupPanel /></div>
    </div>
  );
}
