"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // ignore
  }
  return "system";
}

/**
 * A minimal hand-rolled replacement for next-themes' <ThemeProvider>.
 *
 * next-themes injects its FOUC-prevention script by calling `.toString()` on
 * a bundled function and embedding the result as an inline <script>. On this
 * project's Cloudflare build pipeline, that function gets re-minified with
 * its name preserved via an esbuild `__name(...)` helper call baked directly
 * into the stringified source — a helper that only exists in the *bundle's*
 * module scope, not in the standalone inline script's global scope. The
 * result is `ReferenceError: __name is not defined` on every page load,
 * which aborts hydration before it reaches anything below the header.
 * ThemeScript below renders the equivalent bootstrap logic as a literal
 * string authored directly in source — never a `.toString()`'d function —
 * so there's no function for a bundler to rename or wrap.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const apply = () => {
      const next = theme === "system" ? systemTheme() : theme;
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
    };
    apply();

    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Literal (never minified/renamed) pre-hydration script — sets data-theme before paint to avoid a flash of the wrong theme. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=(t==="light"||t==="dark")?t:d;document.documentElement.setAttribute("data-theme",r);document.documentElement.style.colorScheme=r;}catch(e){}})();`;
