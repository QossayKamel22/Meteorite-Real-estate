"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, UserX, UserCheck } from "lucide-react";
import type { AppUser } from "@/lib/users-data";

function initials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function AdminUsersPanel({ users, currentUid }: { users: AppUser[]; currentUid: string }) {
  const router = useRouter();
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function patch(uid: string, body: Record<string, unknown>) {
    setBusyUid(uid);
    setError("");
    const res = await fetch(`/api/admin/users/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Something went wrong.");
    setBusyUid(null);
    router.refresh();
  }

  if (users.length === 0) {
    return <p className="text-sm text-brand-ink/55">No one has signed in yet.</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}
      <ul className="space-y-3">
        {users.map((u) => {
          const disabled = u.disabled;
          const isSelf = u.uid === currentUid;
          return (
            <li
              key={u.uid}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-line bg-surface p-4"
            >
              <div className="relative h-10 w-10 flex-none overflow-hidden rounded-full bg-brand-navy text-white">
                {u.photoURL ? (
                  <Image src={u.photoURL} alt={u.name ?? u.email ?? "User"} fill className="object-cover" sizes="40px" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-semibold">
                    {initials(u.name, u.email)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">
                  {u.name ?? "Unnamed"} {isSelf && <span className="text-brand-ink/40">(you)</span>}
                </p>
                <p className="truncate text-xs text-brand-ink/55">
                  {u.email ?? "—"} · {u.provider} ·{" "}
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                  u.role === "admin" ? "bg-brand-gold/15 text-brand-gold" : "bg-brand-paper text-brand-ink/50"
                }`}
              >
                {u.role}
              </span>
              {disabled && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                  Disabled
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busyUid === u.uid || isSelf}
                  onClick={() => patch(u.uid, { role: u.role === "admin" ? "user" : "admin" })}
                  title={u.role === "admin" ? "Revoke admin" : "Make admin"}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-40"
                >
                  {u.role === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                </button>
                <button
                  type="button"
                  disabled={busyUid === u.uid || isSelf}
                  onClick={() => patch(u.uid, { disabled: !disabled })}
                  title={disabled ? "Re-enable access" : "Disable access"}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  {disabled ? <UserCheck size={14} /> : <UserX size={14} />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
