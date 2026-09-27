import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Headphones, Home, Pin, PlayCircle, Store, Warehouse } from "lucide-react";
import { company, externalListings } from "@/lib/content";
import { getMediaPosts, type MediaPost } from "@/lib/media-posts-data";
import Reveal from "@/components/Reveal";
import SocialShortcuts from "@/components/SocialShortcuts";
import SocialEmbed from "@/components/SocialEmbed";
import SectionHeading from "@/components/SectionHeading";
import MediaVideo from "@/components/MediaVideo";

export const metadata: Metadata = { title: "Media" };

const categories = [
  { label: "Apartments & Studios", icon: Building2, href: externalListings.bayutForSale + "&category=apartment" },
  { label: "Villas", icon: Home, href: externalListings.bayutForSale + "&category=villa" },
  { label: "Townhouses", icon: Warehouse, href: externalListings.bayutForSale + "&category=townhouse" },
  { label: "Commercial", icon: Store, href: externalListings.bayutForSale + "&category=commercial" },
];

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  youtube: "YouTube",
  other: "Social",
};

function PostCard({ post, delay, featured = false }: { post: MediaPost; delay: number; featured?: boolean }) {
  return (
    <Reveal delay={delay}>
      <article
        className={`glass shimmer-border group relative flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1.5 ${
          featured ? "ring-1 ring-brand-gold/40" : ""
        }`}
      >
        {featured && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-brand-navy/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-gold backdrop-blur">
            <Pin size={10} /> Pinned
          </span>
        )}
        {post.video ? (
          <MediaVideo url={post.video} poster={post.image} />
        ) : (
          post.image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-paper">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, 50vw"
              />
              {post.kind === "social" && post.platform && (
                <span className="absolute left-3 top-3 rounded-full bg-brand-navy/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {PLATFORM_LABEL[post.platform]}
                </span>
              )}
            </div>
          )
        )}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-semibold text-heading">{post.title}</h3>
          {post.body && <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-ink/65">{post.body}</p>}
          {post.kind === "social" && post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:underline"
            >
              View on {post.platform ? PLATFORM_LABEL[post.platform] : "social media"}
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </article>
    </Reveal>
  );
}

function groupPodcastsBySection(podcasts: MediaPost[]): { name: string; posts: MediaPost[] }[] {
  const groups: { name: string; posts: MediaPost[] }[] = [];
  const index = new Map<string, number>();
  for (const post of podcasts) {
    const name = post.section?.trim() || "Podcasts";
    if (!index.has(name)) {
      index.set(name, groups.length);
      groups.push({ name, posts: [] });
    }
    groups[index.get(name)!].posts.push(post);
  }
  return groups;
}

export default async function MediaPage() {
  const allPosts = await getMediaPosts();
  const podcasts = allPosts.filter((p) => p.kind === "podcast");
  const nonPodcasts = allPosts.filter((p) => p.kind !== "podcast");
  const pinnedPosts = nonPodcasts.filter((p) => p.pinned);
  const posts = nonPodcasts.filter((p) => !p.pinned);
  const podcastGroups = groupPodcastsBySection(podcasts);

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

      {podcastGroups.length > 0 && (
        <section className="relative overflow-hidden bg-brand-teal py-16 sm:py-20">
          <div className="glow-field-teal" />
          <div className="grain-overlay" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Reveal>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-teal-soft/20 text-brand-teal-soft ring-1 ring-brand-teal-soft/30">
                  <Headphones size={20} strokeWidth={1.75} />
                </span>
              </Reveal>
              <SectionHeading kicker="Podcasts" title="Listen & watch our episodes" theme="light" />
            </div>
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
                Straight from our Instagram, Facebook and X accounts — playable right here.
              </p>
            </Reveal>

            {podcastGroups.map((group, gi) => (
              <div key={group.name} className={gi === 0 ? "mt-10" : "mt-14"}>
                {(podcastGroups.length > 1 || group.name !== "Podcasts") && (
                  <SectionHeading as="h3" title={group.name} theme="light" />
                )}
                <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${gi === 0 && podcastGroups.length === 1 ? "" : "mt-5"}`}>
                  {group.posts.map((post, i) => (
                    <Reveal key={post.id} delay={i * 0.06}>
                      <div className="glass-teal group overflow-hidden rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-1.5">
                        {post.title && <h3 className="mb-3 text-sm font-semibold text-white">{post.title}</h3>}
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
        <section className={`mx-auto max-w-6xl px-4 ${podcasts.length > 0 ? "pb-16" : "py-16"} sm:px-6 lg:px-8`}>
          <SectionHeading kicker="Featured" title="Pinned highlights" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedPosts.map((post, i) => (
              <PostCard key={post.id} post={post} delay={i * 0.06} featured />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className={`mx-auto max-w-6xl px-4 ${podcasts.length > 0 || pinnedPosts.length > 0 ? "pb-16" : "py-16"} sm:px-6 lg:px-8`}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} delay={i * 0.06} />
            ))}
          </div>
        </section>
      )}

      <section
        className={`mx-auto max-w-6xl px-4 ${
          posts.length > 0 || podcasts.length > 0 || pinnedPosts.length > 0 ? "pb-16" : "py-16"
        } sm:px-6 lg:px-8`}
      >
        <SectionHeading as="h3" title="Property video tours" />
        <Reveal delay={0.2}>
          <p className="mt-1 text-sm text-brand-ink/60">
            Each listing has its own walkthrough video, hosted alongside its full details on our
            verified Bayut portfolio — browse by category to find one.
          </p>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.07}>
              <a
                href={cat.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass shimmer-border group flex h-full flex-col justify-between rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <cat.icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-heading">{cat.label}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-ink/60 group-hover:text-brand-gold">
                  Watch tours <span aria-hidden="true">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

      </section>

      <section className="relative overflow-hidden bg-brand-navy py-20">
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
            <SocialShortcuts />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-brand-ink/45">
          Looking for something specific?{" "}
          <Link href="/contact-us" className="font-medium text-heading hover:text-brand-gold">
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
