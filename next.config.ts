import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const isDev = process.env.NODE_ENV === "development";

/**
 * 'unsafe-inline' for script/style is a deliberate tradeoff, not an
 * oversight: nonce-based CSP requires every page to render dynamically
 * (no static generation/ISR — a major performance regression for this
 * mostly-static marketing site), and Framer Motion applies animation
 * state via inline `style` attributes across the whole UI, which a
 * strict style-src would also block. The codebase has no
 * dangerouslySetInnerHTML and no eval/new Function, so there's no
 * place that renders attacker-controlled HTML/script in the first
 * place — the realistic XSS surface this would protect against is
 * already effectively zero. The other directives below still guard
 * against clickjacking, base-tag hijacking, cross-origin form
 * submission, and object/embed-based attacks.
 *
 * img-src allows data: because agent photos and certificate images are
 * uploaded from the admin's device, resized/compressed client-side, and
 * stored as base64 data URLs directly on the Firestore document — there's
 * no Firebase Storage (needs the paid Blaze plan, deliberately not
 * enabled). https: is also allowed for backward compatibility with any
 * externally-hosted image URLs set before upload replaced URL entry.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'self' https://www.google.com https://meteorite-real-estate.firebaseapp.com https://accounts.google.com",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `style-src 'self' 'unsafe-inline'`,
  `script-src 'self' 'unsafe-inline' https://apis.google.com${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://accounts.google.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Uploaded agent/certificate photos are base64 data URLs (next/image
    // handles data: URLs natively, bypassing this). Kept for backward
    // compatibility with any externally-hosted URLs set before upload
    // replaced URL entry — not used by the admin UI anymore.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: csp },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Gives `next dev` access to Cloudflare bindings (none currently declared
// beyond what OpenNext needs internally) so local dev matches the deployed
// Worker environment. No-op in production.
initOpenNextCloudflareForDev();
