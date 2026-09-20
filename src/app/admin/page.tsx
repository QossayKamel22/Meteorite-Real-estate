import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  IdCard,
  LayoutDashboard,
  ShieldCheck,
  UserX,
  Users as UsersIcon,
} from "lucide-react";
import { getStatsList } from "@/lib/site-stats";
import { getAgents } from "@/lib/agents-data";
import { getCertificates } from "@/lib/certificates-data";
import { listUsers } from "@/lib/users-data";
import { BreakdownPie, SignupsChart, StatsBarChart } from "@/components/AdminOverviewCharts";

export const metadata: Metadata = { title: "Overview · Admin" };
export const dynamic = "force-dynamic";

const DAYS_WINDOW = 14;

function buildSignupSeries(createdAtDates: string[]): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const iso of createdAtDates) {
    const day = iso.slice(0, 10); // YYYY-MM-DD
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const series: { date: string; count: number }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: counts.get(key) ?? 0,
    });
  }
  return series;
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="glass shimmer-border rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <Icon size={16} strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-heading">{value}</p>
      <p className="mt-0.5 text-sm text-brand-ink/55">{label}</p>
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const [fields, agents, certificates, users] = await Promise.all([
    getStatsList(),
    getAgents(),
    getCertificates(),
    listUsers(),
  ]);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const disabledCount = users.filter((u) => u.disabled).length;

  const signupSeries = buildSignupSeries(users.map((u) => u.createdAt).filter((d): d is string => Boolean(d)));

  const roleBreakdown = [
    { name: "Admins", value: adminCount },
    { name: "Users", value: users.length - adminCount },
  ];

  const providerCounts = new Map<string, number>();
  for (const u of users) {
    const label = u.provider === "google.com" ? "Google" : u.provider;
    providerCounts.set(label, (providerCounts.get(label) ?? 0) + 1);
  }
  const providerBreakdown = Array.from(providerCounts, ([name, value]) => ({ name, value }));

  const statsBars = fields.map((f) => ({ label: f.label, value: f.value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <LayoutDashboard size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Overview</h1>
          <p className="text-sm text-brand-ink/55">A live snapshot of the site, pulled from Firestore.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={UsersIcon} label="Total users" value={users.length} href="/admin/users" />
        <StatCard icon={ShieldCheck} label="Admins" value={adminCount} href="/admin/users" />
        <StatCard icon={IdCard} label="Team members" value={agents.length} href="/admin/team" />
        <StatCard icon={UserX} label="Disabled accounts" value={disabledCount} href="/admin/users" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="glass shimmer-border rounded-3xl p-6 sm:p-8 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
            Sign-ins, last {DAYS_WINDOW} days
          </h2>
          <div className="mt-4">
            <SignupsChart data={signupSeries} />
          </div>
        </div>

        <div className="glass shimmer-border rounded-3xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">User roles</h2>
          <div className="mt-2">
            <BreakdownPie data={roleBreakdown} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="glass shimmer-border rounded-3xl p-6 sm:p-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Homepage statistics
            </h2>
            <Link href="/admin/statistics" className="text-xs font-semibold text-brand-gold hover:underline">
              Edit
            </Link>
          </div>
          <div className="mt-4">
            <StatsBarChart data={statsBars} />
          </div>
        </div>

        <div className="glass shimmer-border rounded-3xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
            Sign-in method
          </h2>
          <div className="mt-2">
            <BreakdownPie data={providerBreakdown} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/certificates"
          className="glass shimmer-border flex items-center gap-3 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <ShieldCheck size={16} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-heading">{certificates.length} certificate(s)</p>
            <p className="text-xs text-brand-ink/55">Manage licenses shown on About Us</p>
          </div>
        </Link>
        <Link
          href="/admin/statistics"
          className="glass shimmer-border flex items-center gap-3 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <BarChart3 size={16} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-heading">{fields.length} homepage stat fields</p>
            <p className="text-xs text-brand-ink/55">Edit the numbers shown site-wide</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
