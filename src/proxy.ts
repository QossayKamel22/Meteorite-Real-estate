import { NextResponse, type NextRequest } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge";
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
  matcher: ["/((?!_next|api/admin|.*\\.).*)", "/api/login", "/api/logout"],
};
