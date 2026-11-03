"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Clapperboard, IdCard, Image as ImageIcon, LayoutDashboard, LayoutTemplate, ShieldCheck, Users } from "lucide-react";

const GROUPS = [
  { label: "", items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }] },
  {
    label: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
      { href: "/admin/properties", label: "Properties", icon: Building2 },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
      { href: "/admin/reels", label: "Reels", icon: Clapperboard },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/admin/team", label: "Team", icon: IdCard },
      { href: "/admin/certificates", label: "Certificates", icon: ShieldCheck },
      { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
    ],
  },
  { label: "Access", items: [{ href: "/admin/users", label: "Users", icon: Users }] },
];
const NAV = GROUPS.flatMap((g) => g.items);
const itemIndex = (href: string) => NAV.findIndex((n) => n.href === href);

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-56 flex-none border-r border-brand-line bg-surface px-3 py-6 lg:block">
        <div className="space-y-5">
          {GROUPS.map((g) => (
            <div key={g.label || "top"}>
              {g.label && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/40">{g.label}</p>}
              <ul className="space-y-1">
                {g.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <motion.li key={href} initial={{ opacity: 0, x: reduce ? 0 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.05 * itemIndex(href), ease: [0.22, 1, 0.36, 1] }}>
                      <Link prefetch={false}
                        href={href}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-300 ${
                          active ? "text-white" : "text-brand-ink/65 hover:text-heading"
                        }`}
                      >
                        {active ? (
                          <motion.span layoutId="admin-nav-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute inset-0 rounded-xl bg-brand-navy shadow-[0_10px_24px_-12px_rgba(13,16,49,0.7)] ring-1 ring-brand-gold/30">
                            <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-gold shadow-[0_0_10px_1px_rgba(219,204,59,0.7)]" />
                          </motion.span>
                        ) : (
                          <span aria-hidden="true" className="absolute inset-0 rounded-xl bg-brand-ink/0 transition-colors duration-300 group-hover:bg-brand-ink/[0.05]" />
                        )}
                        <Icon size={16} strokeWidth={1.75} className={`relative transition-transform duration-300 group-hover:scale-110 ${active ? "text-brand-gold" : ""}`} />
                        <span className="relative">{label}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile tab strip */}
      <nav className="sticky top-16 z-40 flex gap-1 overflow-x-auto border-b border-brand-line bg-surface px-3 py-2 lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link prefetch={false}
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
