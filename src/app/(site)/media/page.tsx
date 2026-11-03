import type { Metadata } from "next";
import Link from "next/link";
import {
  Headphones,
  Image as ImageIcon,
  Pin,
  PlayCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import { company, externalListings } from "@/lib/content";
import { getPosterSeries } from "@/lib/poster-series";
import { getMediaPosts, type MediaPost } from "@/lib/media-posts-data";
import Reveal from "@/components/Reveal";
import SocialShortcuts from "@/components/SocialShortcuts";
import { getSocialAccounts } from "@/lib/social-accounts";
import SocialEmbed from "@/components/SocialEmbed";
import SectionHeading from "@/components/SectionHeading";
import DubaiSeries from "@/components/DubaiSeries";
import MediaVideo from "@/components/MediaVideo";
import MediaHeading from "@/components/MediaHeading";
import MediaPostCard from "@/components/MediaPostCard";
import TourTiles from "@/components/TourTiles";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Media & Podcasts",
  description:
    "Watch and listen to Meteorite Real Estate podcast episodes, market insights and news from our team in Dubai.",
  path: "/media",
});

const categories = [
  { key: "apartment", label: "Apartments & Studios", href: externalListings.bayutForSale + "&category=apartment" },
  { key: "villa", label: "Villas", href: externalListings.bayutForSale + "&category=villa" },
  { key: "townhouse", label: "Townhouses", href: externalListings.bayutForSale + "&category=townhouse" },
  { key: "commercial", label: "Commercial", href: externalListings.bayutForSale + "&category=commercial" },
];

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  youtube: "YouTube",
  other: "Social",
};

// Each of these posts can carry a sizeable base64 image/poster — capping how
// many render on one page keeps the page's payload bounded no matter how
// much content piles up in the admin panel over time.
const MAX_PODCASTS_PER_SECTION = 8;
const MAX_REGULAR_POSTS = 12;

function groupPodcastsBySection(podcasts: MediaPost[]): { name: string; posts: MediaPost[] }[] {
  const groups: { name: string; posts: MediaPost[] }[] = [];
  const index = new Map<string, number>();
  for (const post of podcasts) {
    const name = post.section?.trim() || "Podcasts";
    if (!index.has(name)) {
      index.set(name, groups.length);
      groups.push({ name, posts: [] });
    }
    const group = groups[index.get(name)!];
    if (group.posts.length < MAX_PODCASTS_PER_SECTION) group.posts.push(post);
  }
  // Pinned episodes surface first within their section — pinning a podcast
  // is deliberately a different signal from pinning a post: it reorders
  // episodes to the front of their own section rather than moving them into
  // the site-wide "Pinned highlights" grid.
  for (const group of groups) {
    group.posts.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }
  return groups;
}

export default async function MediaPage() {
  const [allPosts, posterSeries] = await Promise.all([getMediaPosts(), getPosterSeries()]);
  const podcasts = allPosts.filter((p) => p.kind === "podcast");
  const nonPodcasts = allPosts.filter((p) => p.kind !== "podcast");
  const pinnedPosts = nonPodcasts.filter((p) => p.pinned);
  const posts = nonPodcasts.filter((p) => !p.pinned).slice(0, MAX_REGULAR_POSTS);
  const podcastGroups = groupPodcastsBySection(podcasts);

  const jumpLinks = [
    podcastGroups.length > 0 && { href: "#podcasts", label: "Podcasts", icon: Headphones },
    pinnedPosts.length > 0 && { href: "#featured", label: "Featured", icon: Sparkles },
    posts.length > 0 && { href: "#posts", label: "Posts", icon: ImageIcon },
    posterSeries.length > 0 && { href: "#series", label: "Posters", icon: Sparkles },
    { href: "#tours", label: "Video Tours", icon: PlayCircle },
    { href: "#follow", label: "Follow Us", icon: Share2 },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Headphones }[];

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
              <PlayCircle size={26} strokeWidth={1.75} />
            </div>
          </Reveal>
          <SectionHeading
            kicker="Media"
            title="News, updates & social"
            as="h1"
            align="center"
            theme="light"
            className="mt-5"
          />
          <Reveal delay={0.25}>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              The latest from our team, plus video tours hosted alongside full listing details on
              our verified Bayut portfolio.
            </p>
          </Reveal>
        </div>
      </section>

      <nav className="sticky top-16 z-30 border-b border-brand-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {jumpLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex flex-none items-center gap-1.5 rounded-full border border-brand-line px-4 py-2 text-xs font-semibold text-brand-ink/65 transition-colors hover:border-brand-gold hover:text-heading"
            >
              <Icon size={13} strokeWidth={1.75} />
              {label}
            </a>
          ))}
        </div>
      </nav>

      {podcastGroups.length > 0 && (
        <section id="podcasts" className="relative scroll-mt-28 overflow-hidden bg-brand-podcast py-20 sm:py-24">
          <div className="glow-field-podcast" />
          <div className="grain-overlay" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Reveal>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-podcast-accent/15 text-brand-podcast-accent ring-1 ring-brand-podcast-accent/30">
                  <Headphones size={20} strokeWidth={1.75} />
                </span>
              </Reveal>
              <SectionHeading kicker="Podcasts" title="Listen & watch our episodes" theme="light" />
            </div>
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                Straight from our Instagram, Facebook and X accounts — playable right here.
              </p>
            </Reveal>

            {podcastGroups.map((group, gi) => (
              <div key={group.name} className={gi === 0 ? "mt-12" : "mt-16"}>
                {(podcastGroups.length > 1 || group.name !== "Podcasts") && (
                  <SectionHeading as="h3" title={group.name} theme="light" />
                )}
                <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${gi === 0 && podcastGroups.length === 1 ? "" : "mt-5"}`}>
                  {group.posts.map((post, i) => (
                    <Reveal key={post.id} delay={i * 0.06}>
                      <div
                        className={`glass-podcast group relative overflow-hidden rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                          post.pinned ? "ring-1 ring-brand-podcast-accent/50" : ""
                        }`}
                      >
                        {post.pinned && (
                          <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-podcast-accent backdrop-blur">
                            <Pin size={10} /> Featured episode
                          </span>
                        )}
                        {post.title && <h3 className="mb-3 pr-24 text-sm font-semibold text-white">{post.title}</h3>}
                        {post.video ? (
                          <MediaVideo
                            url={post.video}
                            poster={post.image}
                            fallbackHref={post.url}
                            fallbackLabel={post.platform ? `Watch on ${PLATFORM_LABEL[post.platform]}` : "Watch episode"}
                          />
                        ) : post.url && post.platform ? (
                          <SocialEmbed platform={post.platform} url={post.url} />
                        ) : null}
                        {post.body && <p className="mt-3 text-sm leading-relaxed text-white/70">{post.body}</p>}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pinnedPosts.length > 0 && (
        <section id="featured" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
          <MediaHeading kicker="Featured" title="Pinned highlights" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedPosts.map((post, i) => (
              <MediaPostCard key={post.id} post={post} delay={i * 0.06} featured />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section id="posts" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
          {(pinnedPosts.length > 0 || podcasts.length > 0) && <MediaHeading kicker="More" title="Latest posts" />}
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${(pinnedPosts.length > 0 || podcasts.length > 0) ? "mt-6" : ""}`}>
            {posts.map((post, i) => (
              <MediaPostCard key={post.id} post={post} delay={i * 0.06} />
            ))}
          </div>
        </section>
      )}

      {posterSeries.length > 0 && (
        <section id="series" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
            <div>
              <SectionHeading kicker="Poster series" title="Dubai, in frames" />
              <Reveal delay={0.15}>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-brand-ink/60">
                  From the Marina to the Burj Al Arab — the posters we share across our channels. Hover to fan them out, tap one to view it full screen or download it.
                </p>
              </Reveal>
            </div>
            <DubaiSeries posters={posterSeries} />
          </div>
        </section>
      )}

      <section id="tours" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <MediaHeading
          as="h3"
          kicker="Walkthroughs"
          title="Property video tours"
          note="Each listing has its own walkthrough video, hosted alongside its full details on our verified Bayut portfolio — browse by category to find one."
        />
        <TourTiles tours={categories.map((c) => ({ key: c.key, label: c.label, href: c.href }))} />
      </section>

      <section id="follow" className="relative scroll-mt-28 overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <SectionHeading kicker="Stay Connected" title="Follow Meteorite everywhere" align="center" theme="light" />
            <Reveal delay={0.25}>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                New listings, walkthroughs, and updates — pick your platform.
              </p>
            </Reveal>
          </div>

          <div className="mt-10">
            <SocialShortcuts accounts={await getSocialAccounts()} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-brand-ink/45">
          Looking for something specific?{" "}
          <Link prefetch={false} href="/contact-us" className="font-medium text-heading hover:text-brand-gold">
            Contact us
          </Link>{" "}
          and we&apos;ll send you a private tour, or{" "}
          <a
            href={`https://wa.me/${company.phoneE164.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-heading hover:text-brand-gold"
          >
            WhatsApp our team
          </a>
          .
        </p>
      </section>
    </div>
  );
}
