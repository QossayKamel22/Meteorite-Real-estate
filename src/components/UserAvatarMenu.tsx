"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LogOut, ShieldCheck } from "lucide-react";
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) {
    return <div className={variant === "desktop" ? "h-9 w-9" : "h-10 w-10"} aria-hidden="true" />;
  }

  if (!user) {
    if (variant === "mobile") {
      return (
        <Link prefetch={false}
          href="/login"
          className="mt-2 rounded-full bg-brand-navy px-5 py-3 text-center text-base font-medium text-white"
        >
          Sign in
        </Link>
      );
    }
    return (
      <Link prefetch={false}
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
          <Link prefetch={false}
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
          className="flex-none text-xs font-semibold text-brand-ink/70 hover:text-heading"
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
        className="flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      >
        <Avatar user={user} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            data-menu=""
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full z-50 mt-2.5 w-60 overflow-hidden rounded-2xl border border-brand-line bg-surface/95 p-1.5 shadow-[0_24px_50px_-20px_rgba(13,16,49,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar user={user} size={34} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-heading">{user.name ?? "Account"}</p>
                {user.email && <p className="truncate text-xs text-brand-ink/50">{user.email}</p>}
              </div>
            </div>
            <div className="my-1 h-px bg-brand-line" />
            <Link prefetch={false} href="/favorites" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-brand-paper hover:text-heading">
              <Heart size={15} className="text-brand-ink/45" /> Saved properties
            </Link>
            {role === "admin" && (
              <Link prefetch={false} href="/admin" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10">
                <ShieldCheck size={15} /> Admin dashboard
              </Link>
            )}
            <div className="my-1 h-px bg-brand-line" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-brand-ink/70 transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut size={15} /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
