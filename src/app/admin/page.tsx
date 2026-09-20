import type { Metadata } from "next";
import { BarChart3, Clock, IdCard, ShieldCheck, Users } from "lucide-react";
import { getStatsList } from "@/lib/site-stats";
import { getAgents } from "@/lib/agents-data";
import { getCertificates } from "@/lib/certificates-data";
import { listUsers } from "@/lib/users-data";
import { getSessionUser } from "@/lib/session";
import AdminStatsForm from "@/components/AdminStatsForm";
import AdminAgentsPanel from "@/components/AdminAgentsPanel";
import AdminCertificatesPanel from "@/components/AdminCertificatesPanel";
import AdminUsersPanel from "@/components/AdminUsersPanel";
import AdminSignOutButton from "@/components/AdminSignOutButton";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [fields, agents, certificates, users, session] = await Promise.all([
    getStatsList(),
    getAgents(),
    getCertificates(),
    listUsers(),
    getSessionUser(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-ink/55">
            Manage the numbers, team, and certificates shown across the site.
          </p>
        </div>
        <AdminSignOutButton />
      </div>

      <section className="glass shimmer-border mt-8 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <BarChart3 size={16} strokeWidth={1.75} />
          </span>
          <h2 className="text-lg font-semibold text-heading">Homepage Statistics</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
          These four numbers appear on the Homepage, About Us, and Payment page stat sections.
        </p>
        <div className="mt-6">
          <AdminStatsForm fields={fields} />
        </div>
      </section>

      <section className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <IdCard size={16} strokeWidth={1.75} />
          </span>
          <h2 className="text-lg font-semibold text-heading">Team</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
          Shown on the Homepage &quot;Our Team&quot; section, the About Us &quot;Leadership &amp;
          Team&quot; section, and the Faces &amp; Places photo strip. The first agent with a bio
          filled in appears as the featured Leadership profile.
        </p>
        <div className="mt-6">
          <AdminAgentsPanel agents={agents} />
        </div>
      </section>

      <section className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <ShieldCheck size={16} strokeWidth={1.75} />
          </span>
          <h2 className="text-lg font-semibold text-heading">Certificates</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
          Shown in the About Us &quot;Our Certificate&quot; section.
        </p>
        <div className="mt-6">
          <AdminCertificatesPanel certificates={certificates} />
        </div>
      </section>

      <section className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <Users size={16} strokeWidth={1.75} />
          </span>
          <h2 className="text-lg font-semibold text-heading">Users</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
          Everyone who has signed in with Google. Grant or revoke admin access, or disable an
          account entirely.
        </p>
        <div className="mt-6">
          <AdminUsersPanel users={users} currentUid={session?.uid ?? ""} />
        </div>
      </section>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-brand-ink/40">
        <Clock size={13} />
        Signed in via Google — admin access is controlled from the Users section above.
      </p>
    </div>
  );
}
