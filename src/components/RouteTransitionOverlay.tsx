"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LogoLoadingOverlay from "@/components/LogoLoadingOverlay";

const MIN_VISIBLE_MS = 650;

export default function RouteTransitionOverlay() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return <LogoLoadingOverlay visible={visible} />;
}
