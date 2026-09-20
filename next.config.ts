import type { NextConfig } from "next";

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
 * img-src allows https: broadly because the admin dashboard lets an
 * authenticated admin paste an arbitrary image URL for agent photos
 * and certificates (see next.config images.remotePatterns below) — a
 * deliberate tradeoff for "no Storage/Blaze plan" per project decision.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'self' https://www.google.com https://meteorite-real-estate.firebaseapp.com",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `style-src 'self' 'unsafe-inline'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Admin-pasted agent/certificate image URLs can come from any host —
    // there's no file upload (Firebase Storage needs the paid Blaze plan,
    // deliberately not enabled). Trusted because only an authenticated
    // admin can set these URLs, not arbitrary site visitors.
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
