"use client";

import { useAuth } from "@/lib/auth-context";
import LogoLoadingOverlay from "@/components/LogoLoadingOverlay";

/**
 * Shown while a sign-in/register/sign-out action is actually in flight (not
 * during the initial silent auth check on page load — that's a separate,
 * quieter loading state). Mounted once at the root so it appears above
 * every page, regardless of where the action was triggered from.
 */
export default function AuthLoadingOverlay() {
  const { actionLoading } = useAuth();
  return <LogoLoadingOverlay visible={actionLoading} />;
}
