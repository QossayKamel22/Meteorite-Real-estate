"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const RELOAD_KEY = "meteorite:style-reload";

/** True when the site's stylesheet is really applied (its brand colour is defined). */
const stylesApplied = () => getComputedStyle(document.documentElement).getPropertyValue("--brand-navy").trim() !== "";

/**
 * Safety net for the rare page that shows up as plain text because its stylesheet didn't
 * arrive (a dropped connection or a request that failed while moving between pages).
 * After every page change it checks that the styles are in place; if not, it asks the
 * browser to fetch the stylesheets again, and as a last resort reloads the page once.
 */
export default function StyleGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const timers: number[] = [];
    const retryLinks = () => {
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href*="/_next/static/"]').forEach((link) => {
        const fresh = link.cloneNode() as HTMLLinkElement;
        const url = new URL(link.href);
        url.searchParams.set("r", String(Date.now()));
        fresh.href = url.toString();
        fresh.removeAttribute("data-precedence");
        fresh.addEventListener("load", () => link.remove(), { once: true });
        document.head.appendChild(fresh);
      });
    };
    const check = (attempt: number) => {
      if (stylesApplied()) return;
      if (attempt === 0) {
        retryLinks();
        timers.push(window.setTimeout(() => check(1), 2500));
        return;
      }
      try {
        if (sessionStorage.getItem(RELOAD_KEY) === pathname) return; // already tried on this page
        sessionStorage.setItem(RELOAD_KEY, pathname);
      } catch {
        return;
      }
      window.location.reload();
    };
    timers.push(window.setTimeout(() => check(0), 1200));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  return null;
}
