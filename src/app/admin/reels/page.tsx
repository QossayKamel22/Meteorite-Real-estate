import type { Metadata } from "next";
import { Clapperboard } from "lucide-react";
import { getReels } from "@/lib/reels-data";
import { getSocialAccounts } from "@/lib/social-accounts";
import AdminReelsPanel from "@/components/AdminReelsPanel";

export const metadata: Metadata = { title: "Reels · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReelsPage() {
  const [reels, accounts] = await Promise.all([getReels({ includeHidden: true }), getSocialAccounts()]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <Clapperboard size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Reels</h1>
          <p className="text-sm text-brand-ink/55">
            The reel wall on the homepage: videos from TikTok, Instagram, YouTube and Facebook. Paste a link to add one.
          </p>
        </div>
      </div>
      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminReelsPanel reels={reels} accounts={accounts} />
      </div>
    </div>
  );
}
