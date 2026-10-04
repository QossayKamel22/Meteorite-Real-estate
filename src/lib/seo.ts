import type { Metadata } from "next";
import { SITE_URL, company } from "@/lib/content";

const SITE_NAME = company.name;
const OG_IMAGE = { url: "/brand/hero-dubai-skyline.jpg", width: 1349, height: 650, alt: SITE_NAME };

/**
 * Per-page metadata. A route's `openGraph`/`twitter`/`alternates` replace the
 * parent's wholesale rather than merging, so every public page builds the full
 * set here. Relative URLs resolve against `metadataBase` (the production
 * domain), so canonicals always point at meteoriterealestate.com even when the
 * page is served from the workers.dev URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  /** Omit for the homepage (falls back to the layout's default title). */
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_AE",
      url: path,
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export { SITE_URL };
