"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const NAVY = "#0d1031";
const GOLD = "#dbcc3b";
const PIE_COLORS = [GOLD, NAVY, "#5E5CE6", "#30D158", "#FF453A"];

export function SignupsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GOLD} stopOpacity={0.45} />
            <stop offset="95%" stopColor={GOLD} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-line, #e6e6e6)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e6e6e6", fontSize: 12 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="New sign-ins"
          stroke={GOLD}
          strokeWidth={2}
          fill="url(#signupsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BreakdownPie({ data }: { data: { name: string; value: number }[] }) {
  const hasData = data.some((d) => d.value > 0);
  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-brand-ink/40">
        No data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e6e6", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatsBarChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e6e6", fontSize: 12 }} />
        <Bar dataKey="value" fill={NAVY} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
