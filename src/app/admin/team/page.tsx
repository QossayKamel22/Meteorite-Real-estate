import type { Metadata } from "next";
import { IdCard } from "lucide-react";
import { getAgents } from "@/lib/agents-data";
import AdminAgentsPanel from "@/components/AdminAgentsPanel";

export const metadata: Metadata = { title: "Team · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const agents = await getAgents();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <IdCard size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Team</h1>
          <p className="text-sm text-brand-ink/55">
            Shown on the Homepage &quot;Our Team&quot; section, the About Us &quot;Leadership &amp;
            Team&quot; section, and the Faces &amp; Places photo strip.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminAgentsPanel agents={agents} />
      </div>
    </div>
  );
}
