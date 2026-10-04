import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

// Public, indexable pages only (sign-in, register, favorites, create-property
// and /admin are intentionally left out).
const PAGES: { path: string; changeFrequency: "daily" | "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/for-sale", changeFrequency: "daily", priority: 0.9 },
  { path: "/for-rent", changeFrequency: "daily", priority: 0.9 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/media", changeFrequency: "weekly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
