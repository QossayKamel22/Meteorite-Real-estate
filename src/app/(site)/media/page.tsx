import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Home, PlayCircle, Store, Warehouse } from "lucide-react";
import { company, externalListings } from "@/lib/content";
import { getMediaPosts } from "@/lib/media-posts-data";
import Reveal from "@/components/Reveal";
import SocialShortcuts from "@/components/SocialShortcuts";

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

export default async function MediaPage() {
  const posts = await getMediaPosts();

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
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Media
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              News, updates &amp; social
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              The latest from our team, plus video tours hosted alongside full listing details on
              our verified Bayut portfolio.
            </p>
          </Reveal>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.06}>
                <article className="glass shimmer-border flex h-full flex-col overflow-hidden rounded-2xl">
                  {post.image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-paper">
                      <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
                      {post.kind === "social" && post.platform && (
                        <span className="absolute left-3 top-3 rounded-full bg-brand-navy/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          {PLATFORM_LABEL[post.platform]}
                        </span>
                      )}
                    </div>
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
            ))}
          </div>
        </section>
      )}

      <section className={`mx-auto max-w-6xl px-4 ${posts.length > 0 ? "pb-16" : "py-16"} sm:px-6 lg:px-8`}>
        <Reveal>
          <h2 className="text-lg font-semibold text-heading">Property video tours</h2>
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
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Stay Connected
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Follow Meteorite everywhere
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
                New listings, walkthroughs, and updates — pick your platform.
              </p>
            </div>
          </Reveal>

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
