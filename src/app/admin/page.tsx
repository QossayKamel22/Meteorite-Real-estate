import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Eye,
  IdCard,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  UserX,
  Users as UsersIcon,
} from "lucide-react";
import { getStatsList } from "@/lib/site-stats";
import { getAgents } from "@/lib/agents-data";
import { getCertificates } from "@/lib/certificates-data";
import { listUsers } from "@/lib/users-data";
import { getAnalyticsSummary } from "@/lib/analytics-data";
import { BreakdownPie, SignupsChart, StatsBarChart } from "@/components/AdminOverviewCharts";
import SectionHeading from "@/components/SectionHeading";

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
    <Link prefetch={false}
      href={href}
      className="glass shimmer-border rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
          <Icon size={16} strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-heading">{value}</p>
      <p className="mt-0.5 text-sm text-brand-ink/55">{label}</p>
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const [fields, agents, certificates, users, analytics] = await Promise.all([
    getStatsList({ includeHidden: true }),
    getAgents({ includeHidden: true }),
    getCertificates({ includeHidden: true }),
    listUsers(),
    getAnalyticsSummary(),
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
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-10 sm:py-12">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
            <LayoutDashboard size={20} strokeWidth={1.75} />
          </span>
          <SectionHeading kicker="Admin" title="Overview" theme="light" as="h1" titleClassName="text-2xl font-semibold tracking-tight text-white sm:text-3xl" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
            <Eye size={16} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-heading">Site traffic</h2>
            <p className="text-sm text-brand-ink/55">Best-effort visit tracking, aggregated per day.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Eye} label="Visits (all time)" value={analytics.totalAllTime} href="/admin" />
          <StatCard icon={TrendingUp} label="Visits today" value={analytics.totalToday} href="/admin" />
          <StatCard icon={UsersIcon} label="Total users" value={users.length} href="/admin/users" />
          <StatCard icon={IdCard} label="Team members" value={agents.length} href="/admin/team" />
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="glass shimmer-border rounded-3xl p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-8 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Site visits, last {DAYS_WINDOW} days
            </h3>
            <div className="mt-4">
              <SignupsChart data={analytics.last14Days} name="Page views" gradientId="visitsFill" color="#5E5CE6" />
            </div>
          </div>

          <div className="glass shimmer-border rounded-3xl p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Visits by section
            </h3>
            <div className="mt-2">
              <BreakdownPie data={analytics.breakdown} />
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
            <UsersIcon size={16} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-heading">Users &amp; team</h2>
            <p className="text-sm text-brand-ink/55">Accounts, roles, and sign-in activity.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={ShieldCheck} label="Admins" value={adminCount} href="/admin/users" />
          <StatCard icon={UserX} label="Disabled accounts" value={disabledCount} href="/admin/users" />
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="glass shimmer-border rounded-3xl p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-8 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Sign-ins, last {DAYS_WINDOW} days
            </h3>
            <div className="mt-4">
              <SignupsChart data={signupSeries} />
            </div>
          </div>

          <div className="glass shimmer-border rounded-3xl p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">User roles</h3>
            <div className="mt-2">
              <BreakdownPie data={roleBreakdown} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="glass shimmer-border rounded-3xl p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Sign-in method
            </h3>
            <div className="mt-2">
              <BreakdownPie data={providerBreakdown} />
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
            <BarChart3 size={16} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-heading">Site content</h2>
            <p className="text-sm text-brand-ink/55">Homepage stats and certificates, at a glance.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="glass shimmer-border rounded-3xl p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
                Homepage statistics
              </h3>
              <Link prefetch={false} href="/admin/statistics" className="text-xs font-semibold text-brand-gold hover:underline">
                Edit
              </Link>
            </div>
            <div className="mt-4">
              <StatsBarChart data={statsBars} />
            </div>
          </div>

          <Link prefetch={false}
            href="/admin/certificates"
            className="glass shimmer-border group flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20 transition-transform duration-300 group-hover:scale-110">
              <ShieldCheck size={18} strokeWidth={1.75} />
            </span>
            <div className="mt-6">
              <p className="text-2xl font-semibold tracking-tight text-heading">{certificates.length}</p>
              <p className="mt-0.5 text-sm text-brand-ink/55">Certificate(s) shown on About Us</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
