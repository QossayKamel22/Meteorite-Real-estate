"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth-context";

// Apple-style pastel avatar palette — picked deterministically per user.
const AVATAR_COLORS = [
  "#FF9F0A",
  "#FF453A",
  "#FF375F",
  "#BF5AF2",
  "#5E5CE6",
  "#0A84FF",
  "#64D2FF",
  "#30D158",
];

function colorForUser(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsForUser(user: AuthUser): string {
  const source = user.name?.trim() || user.email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function Avatar({ user, size = 36 }: { user: AuthUser; size?: number }) {
  if (user.photoURL) {
    return (
      <Image
        src={user.photoURL}
        alt={user.name ?? "Account"}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white/60"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white/60"
      style={{ width: size, height: size, backgroundColor: colorForUser(user.uid), fontSize: size * 0.38 }}
    >
      {initialsForUser(user)}
    </div>
  );
}

export default function UserAvatarMenu({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { user, role, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (loading) {
    return <div className={variant === "desktop" ? "h-9 w-9" : "h-10 w-10"} aria-hidden="true" />;
  }

  if (!user) {
    if (variant === "mobile") {
      return (
        <Link
          href="/login"
          className="mt-2 rounded-full bg-brand-navy px-5 py-3 text-center text-base font-medium text-white"
        >
          Sign in
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className="ml-2 rounded-full bg-brand-navy px-5 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-brand-navy-light"
      >
        Sign in
      </Link>
    );
  }

  if (variant === "mobile") {
    return (
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-brand-line px-3 py-2.5">
        <Avatar user={user} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-heading">{user.name ?? user.email}</p>
          {user.name && <p className="truncate text-xs text-brand-ink/50">{user.email}</p>}
        </div>
        {role === "admin" && (
          <Link
            href="/admin"
            className="flex flex-none items-center gap-1 rounded-full bg-brand-gold/15 px-3 py-1.5 text-xs font-semibold text-brand-gold"
          >
            <ShieldCheck size={12} />
            Admin
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex-none text-xs font-semibold text-brand-ink/60 hover:text-heading"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative ml-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center justify-center rounded-full transition-transform hover:scale-105"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div
          role="menu"
          className="glass shimmer-border absolute right-0 top-full mt-2 w-56 rounded-2xl p-2"
        >
          <div className="flex items-center gap-3 border-b border-brand-line/70 px-2 pb-3 pt-1">
            <Avatar user={user} size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">
                {user.name ?? "Account"}
              </p>
              {user.email && <p className="truncate text-xs text-brand-ink/50">{user.email}</p>}
            </div>
          </div>
          <Link
            href="/favorites"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg px-2 py-2 text-sm font-medium text-brand-ink/80 hover:bg-brand-paper"
          >
            Saved properties
          </Link>
          {role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-brand-gold hover:bg-brand-gold/10"
            >
              <ShieldCheck size={14} />
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="mt-0.5 block w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-brand-ink/80 hover:bg-brand-paper"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
