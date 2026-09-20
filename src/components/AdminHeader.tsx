"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import AdminSignOutButton from "@/components/AdminSignOutButton";

export default function AdminHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag to avoid SSR/client theme mismatch
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/brand/logo-transparent.png"
            alt="Meteorite Real Estate"
            width={132}
            height={24}
            className="h-6 w-auto"
          />
          <span className="flex items-center gap-1 rounded-full bg-brand-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-gold">
            <ShieldCheck size={12} />
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <AdminSignOutButton />
        </div>
      </div>
    </header>
  );
}
