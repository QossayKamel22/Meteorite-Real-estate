import type { Metadata } from "next";
import { Users } from "lucide-react";
import { listUsers } from "@/lib/users-data";
import { getSessionUser } from "@/lib/session";
import AdminUsersPanel from "@/components/AdminUsersPanel";

export const metadata: Metadata = { title: "Users · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([listUsers(), getSessionUser()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <Users size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Users</h1>
          <p className="text-sm text-brand-ink/55">
            Everyone who has signed in with Google. Grant or revoke admin access, or disable an
            account entirely.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminUsersPanel users={users} currentUid={session?.uid ?? ""} />
      </div>
    </div>
  );
}
