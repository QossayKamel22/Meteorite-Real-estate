import { NextResponse, type NextRequest } from "next/server";
import { handleTrackVisit } from "@/lib/track-visit";
import {
  authApiKey,
  authCookieName,
  authCookieSerializeOptions,
  authCookieSignatureKeys,
  authServiceAccount,
} from "@/lib/edge-auth-config";

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  // Page-view beacon: answered here, in the lightweight middleware layer, so a
  // cold Worker never has to load the full Next server bundle for it.
  if (request.nextUrl.pathname === "/api/track-visit") {
    return request.method === "POST" ? handleTrackVisit(request) : NextResponse.next();
  }

  // Loaded on demand: evaluating this library is the bulk of a cold start, and the
  // visit beacon above (the busiest route here) never needs it.
  const { authMiddleware } = await import("next-firebase-auth-edge");
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: authApiKey,
    cookieName: authCookieName,
    cookieSignatureKeys: authCookieSignatureKeys,
    cookieSerializeOptions: authCookieSerializeOptions,
    serviceAccount: authServiceAccount,

    handleValidToken: async ({ decodedToken }, headers) => {
      // Admin status is a custom claim baked into the token — kept in sync
      // by users-data.ts whenever a role changes, and refreshed at least
      // hourly by this library's own token-refresh cycle.
      if (request.nextUrl.pathname.startsWith("/admin") && decodedToken.admin !== true) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next({ request: { headers } });
    },

    // No token, or an invalid one: fine for public pages (guests browse
    // freely), but /admin/** requires signing in first.
    handleInvalidToken: async () => {
      if (request.nextUrl.pathname.startsWith("/admin")) {
        return redirectToLogin(request);
      }
      return NextResponse.next();
    },

    handleError: async (error) => {
      console.error("Auth middleware error", error);
      if (request.nextUrl.pathname.startsWith("/admin")) {
        return redirectToLogin(request);
      }
      return NextResponse.next();
    },
  });
}

export const config = {
  // Only the routes that actually need the auth middleware. Public pages never
  // read the session (admin pages and admin APIs verify it themselves), so
  // running the Firebase auth middleware on every public request and Link
  // prefetch was pure per-request CPU on a Worker with a tiny CPU budget.
  matcher: ["/admin/:path*", "/api/login", "/api/logout", "/api/track-visit"],
};
