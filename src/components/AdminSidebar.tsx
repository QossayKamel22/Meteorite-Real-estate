"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, IdCard, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/admin/team", label: "Team", icon: IdCard },
  { href: "/admin/certificates", label: "Certificates", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-56 flex-none border-r border-brand-line bg-surface px-3 py-6 lg:block">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-navy text-white"
                      : "text-brand-ink/65 hover:bg-brand-paper hover:text-heading"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile tab strip */}
      <nav className="sticky top-16 z-40 flex gap-1 overflow-x-auto border-b border-brand-line bg-surface px-3 py-2 lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-none items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                active ? "bg-brand-navy text-white" : "bg-brand-paper text-brand-ink/60"
              }`}
            >
              <Icon size={13} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
