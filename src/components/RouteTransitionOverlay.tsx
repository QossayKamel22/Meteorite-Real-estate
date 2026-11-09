"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LogoLoadingOverlay from "@/components/LogoLoadingOverlay";

/** The logo screen appears only if a page change is genuinely slow; quick navigations just get the thin bar. */
const SLOW_AFTER_MS = 450;
/** Give up waiting (and clear the indicators) if a navigation never completes. */
const GIVE_UP_MS = 12000;

type Phase = "idle" | "run" | "finish";

/**
 * Feedback for page changes that starts the moment a link is clicked (not after the new page has already
 * arrived) and ends the moment it does: a thin gold progress bar straight away, and the full logo loading
 * screen only when the change takes longer than SLOW_AFTER_MS. It never holds a finished page back.
 */
export default function RouteTransitionOverlay() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [phase, setPhase] = useState<Phase>("idle");
  const [slow, setSlow] = useState(false);
  const slowTimer = useRef<number | undefined>(undefined);
  const giveUpTimer = useRef<number | undefined>(undefined);
  const finishTimer = useRef<number | undefined>(undefined);

  // Start: an internal link was clicked, or the user went back/forward.
  useEffect(() => {
    function begin() {
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(slowTimer.current);
      window.clearTimeout(giveUpTimer.current);
      setPhase("run");
      slowTimer.current = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
      giveUpTimer.current = window.setTimeout(() => {
        setPhase("idle");
        setSlow(false);
      }, GIVE_UP_MS);
    }
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      begin();
    }
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(slowTimer.current);
      window.clearTimeout(giveUpTimer.current);
      window.clearTimeout(finishTimer.current);
    };
  }, []);

  // End: the new page has arrived.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    window.clearTimeout(slowTimer.current);
    window.clearTimeout(giveUpTimer.current);
    setSlow(false);
    setPhase("finish");
    finishTimer.current = window.setTimeout(() => setPhase("idle"), 500);
  }, [pathname]);

  return (
    <>
      <div aria-hidden="true" data-phase={phase} className="nav-bar pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 bg-brand-gold" />
      <LogoLoadingOverlay visible={slow} />
    </>
  );
}
