import { NextResponse, type NextRequest } from "next/server";
import { handleTrackVisit } from "@/lib/track-visit";
import { handleDocImage } from "@/lib/doc-image";
import { IMAGE_KINDS, type ImageKind } from "@/lib/image-url";
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

const NOT_FOUND_HTML = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Meteorite Real Estate</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#faf9f6;color:#0d1031;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:24px}h1{font-size:28px;margin:0 0 8px}p{margin:0 0 24px;opacity:.65}a{display:inline-block;background:#0d1031;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600}</style><div><h1>Page not found</h1><p>The page you're looking for doesn't exist or has moved.</p><a href="/">Back to home</a></div>`;

function notFoundFast(): Response {
  return new Response(NOT_FOUND_HTML, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" },
  });
}

export async function proxy(request: NextRequest) {
  // Page-view beacon: answered here, in the lightweight middleware layer, so a
  // cold Worker never has to load the full Next server bundle for it.
  const imageMatch = /^\/api\/img\/([a-z]+)\/([^/]+)$/.exec(request.nextUrl.pathname);
  if (imageMatch) {
    const kind = imageMatch[1] as ImageKind;
    return IMAGE_KINDS.includes(kind) ? handleDocImage(request, kind, imageMatch[2]) : NextResponse.next();
  }
  if (request.nextUrl.pathname === "/api/track-visit") {
    return request.method === "POST" ? handleTrackVisit(request) : NextResponse.next();
  }

  // Anything else that reaches here came through the catch-all matcher below, i.e. a
  // path that isn't a page of this site (WordPress scanners probing /xmlrpc.php,
  // /wp-login.php, old /location/... URLs). Answer with a tiny static 404 instead of
  // letting Next render its full not-found page (~250ms of CPU on the Free plan).
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/admin" || path.startsWith("/admin/") || path === "/api/login" || path === "/api/logout";
  if (!isAuthRoute) return notFoundFast();

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
  // Only the routes that actually need this middleware:
  //  - /admin, /api/login, /api/logout  -> Firebase auth
  //  - /api/track-visit, /api/img/*  -> answered here, cheaply
  //  - everything that is NOT a known page/route of this site -> fast static 404 (see above)
  // Known pages (/, /about-us, ...) never run this code, so they stay as cheap as before.
  matcher: [
    "/admin/:path*",
    "/api/login",
    "/api/logout",
    "/api/track-visit",
    "/api/img/:path*",
    "/((?!(?:about-us|contact-us|for-sale|for-rent|media|privacy-policy|login|register|favorites|create-property|admin|api|_next)(?:/|$)|robots\\.txt$|sitemap\\.xml$|favicon\\.ico$|icon\\.png$|$).+)",
  ],
};
