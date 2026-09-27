"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Fires a best-effort page-view beacon on first load and on every client-side navigation. */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const body = JSON.stringify({ path: pathname });
    try {
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon("/api/track-visit", blob)) {
        fetch("/api/track-visit", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      }
    } catch {
      // best-effort only — never blocks rendering
    }
  }, [pathname]);

  return null;
}
