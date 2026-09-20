"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AdminSignOutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
    >
      <LogOut size={14} />
      Sign out
    </button>
  );
}
