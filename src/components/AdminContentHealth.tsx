import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert } from "lucide-react";
import { getReels } from "@/lib/reels-data";
import { getMediaPosts } from "@/lib/media-posts-data";
import { getHeroImages } from "@/lib/hero-images";
import { getPosterSeries } from "@/lib/poster-series";
import { getProperties } from "@/lib/properties-data";
import { getCertificates } from "@/lib/certificates-data";
import { getFeaturedProjects } from "@/lib/featured-projects-data";
import { getTestimonials } from "@/lib/testimonials-data";
import { getSocialAccounts } from "@/lib/social-accounts";
import { MAX_PINNED_POSTS } from "@/lib/media-posts-constants";

type Row = { label: string; value: string; ok: boolean; hint?: string; href: string };

/**
 * "Content check": one list that reads the site's own content and says what is live and what
 * needs attention (an Instagram reel without a cover, no YouTube link, an expired certificate...).
 * It is computed on the server when the overview opens, so it adds nothing to the public site.
 */
export default async function AdminContentHealth() {
  const [reels, posts, hero, posters, sale, rent, certs, featured, reviews, accounts] = await Promise.all([
    getReels({ includeHidden: true }),
    getMediaPosts({ includeHidden: true }),
    getHeroImages(),
    getPosterSeries(),
    getProperties({ purpose: "sale" }),
    getProperties({ purpose: "rent" }),
    getCertificates({ includeHidden: true }),
    getFeaturedProjects({ includeHidden: true }),
    getTestimonials({ includeHidden: true }),
    getSocialAccounts(),
  ]);

  const visibleReels = reels.filter((r) => r.visible);
  const noCover = reels.filter((r) => r.visible && r.platform === "instagram" && !r.cover).length;
  const pinned = posts.filter((p) => p.pinned && p.visible !== false).length;
  const today = new Date();
  const expiring = certs.filter((c) => {
    const m = c.expiryDate?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return false;
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return d.getTime() - today.getTime() < 1000 * 60 * 60 * 24 * 90;
  }).length;

  const rows: Row[] = [
    { label: "Hero pictures", value: `${hero.length} in the slideshow`, ok: hero.length >= 3, hint: hero.length < 3 ? "Add a few more so it keeps changing." : undefined, href: "/admin/homepage" },
    { label: "Reels", value: `${visibleReels.length} live`, ok: visibleReels.length > 0 && noCover === 0, hint: noCover ? `${noCover} Instagram reel(s) have no cover yet.` : visibleReels.length === 0 ? "The reel section is hidden while there are none." : undefined, href: "/admin/reels" },
    { label: "Social links", value: accounts.youtube ? "TikTok + YouTube" : "TikTok only", ok: Boolean(accounts.youtube), hint: accounts.youtube ? undefined : "Add the YouTube channel link to show its button.", href: "/admin/reels" },
    { label: "Media posts", value: `${posts.filter((p) => p.visible !== false).length} live · ${pinned}/${MAX_PINNED_POSTS} pinned`, ok: posts.length > 0, href: "/admin/media" },
    { label: "Poster series", value: `${posters.length} posters`, ok: posters.length > 0, href: "/admin/media" },
    { label: "Listings", value: `${sale.length} for sale · ${rent.length} for rent`, ok: sale.length + rent.length > 0, href: "/admin/properties" },
    { label: "Featured projects", value: `${featured.filter((f) => f.visible !== false).length} live`, ok: featured.length > 0, href: "/admin/homepage" },
    { label: "Reviews", value: `${reviews.filter((r) => r.visible !== false).length} shown`, ok: reviews.length > 0, href: "/admin/homepage" },
    { label: "Certificates", value: `${certs.length} on About Us`, ok: certs.length > 0 && expiring === 0, hint: expiring ? `${expiring} expire within 90 days — upload the renewed one.` : undefined, href: "/admin/certificates" },
  ];
  const todo = rows.filter((r) => !r.ok).length;

  return (
    <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/66">Content check</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${todo === 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>{todo === 0 ? "All good" : `${todo} to look at`}</span>
      </div>
      <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.label} className="border-b border-brand-line last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-0">
            <Link prefetch={false} href={r.href} className="group flex items-start gap-3 py-3">
              {r.ok ? <CheckCircle2 size={17} className="mt-0.5 flex-none text-emerald-500" /> : <CircleAlert size={17} className="mt-0.5 flex-none text-amber-500" />}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-heading">{r.label}</span>
                  <span className="truncate text-xs tabular-nums text-brand-ink/66">{r.value}</span>
                </span>
                {r.hint && <span className="mt-0.5 block text-xs text-amber-600">{r.hint}</span>}
              </span>
              <ArrowUpRight size={14} className="mt-1 flex-none text-brand-ink/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
