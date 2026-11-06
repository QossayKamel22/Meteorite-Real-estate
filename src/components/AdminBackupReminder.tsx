"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DatabaseBackup } from "lucide-react";
import { BACKUP_KEY } from "@/lib/backup-shared";

/** A quiet nudge on the overview when no backup has been made on this computer for a week. */
export default function AdminBackupReminder() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    let last: string | null = null;
    try {
      last = localStorage.getItem(BACKUP_KEY);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a browser-only value once
    setDays(last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : 999);
  }, []);
  if (days === null || days < 7) return null;
  return (
    <Link prefetch={false} href="/admin/backup" className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-heading transition-colors hover:border-amber-500">
      <DatabaseBackup size={17} className="flex-none text-amber-600" />
      <span className="flex-1">{days >= 999 ? "No backup has been made on this computer yet." : `It has been ${days} days since your last backup.`} Download one now.</span>
      <span className="font-semibold text-gold-ink">Back up →</span>
    </Link>
  );
}
