"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ExternalLink, Pin } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import type { MediaPost } from "@/lib/media-posts-data";
import MediaVideo from "@/components/MediaVideo";

const EASE = [0.22, 1, 0.36, 1] as const;
const PLATFORM_LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", twitter: "X", youtube: "YouTube", other: "Social" };

/**
 * A Media post, kept quiet: it fades up into place, its picture settles from a slight zoom, and
 * on hover the card lifts a little while a fine gold line draws across its top. Pinned posts
 * differ only by a gold hairline frame and a small "Pinned" label.
 */
export default function MediaPostCard({ post, delay, featured = false }: { post: MediaPost; delay: number; featured?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className="relative h-full"
    >
      <article
        className={`glass group relative flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(13,16,49,0.55)] ${featured ? "bg-surface ring-1 ring-brand-gold/40" : "shimmer-border"}`}
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-gradient-to-r from-brand-gold to-brand-gold-soft transition-transform duration-700 group-hover:scale-x-100" />
        {featured && (
          <span className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-brand-navy/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-gold backdrop-blur">
            <Pin size={10} /> Pinned
          </span>
        )}
        {post.video ? (
          <MediaVideo url={post.video} poster={post.image} />
        ) : (
          post.image && (
            <div className={`relative w-full overflow-hidden bg-brand-paper ${post.portrait ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
              <motion.div
                initial={{ scale: reduce ? 1 : 1.08, opacity: reduce ? 1 : 0 }}
                animate={show ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: reduce ? 0 : 1.3, delay: delay + 0.1, ease: EASE }}
                className="absolute inset-0"
              >
                <Image src={post.image} unoptimized={isServedImage(post.image)} alt={post.title} fill className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" sizes="(min-width: 1024px) 33vw, 50vw" />
              </motion.div>
              {post.kind === "social" && post.platform && (
                <span className="absolute left-3 top-3 rounded-full bg-brand-navy/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{PLATFORM_LABEL[post.platform]}</span>
              )}
            </div>
          )
        )}
        <div className="relative flex flex-1 flex-col p-5">
          <h3 className="text-base font-semibold text-heading transition-colors duration-300 group-hover:text-brand-gold">{post.title}</h3>
          {post.body && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-ink/65">{post.body}</p>}
          {post.kind === "social" && post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="group/l mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:underline">
              View on {post.platform ? PLATFORM_LABEL[post.platform] : "social media"}
              <ExternalLink size={13} className="transition-transform duration-300 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5" />
            </a>
          )}
        </div>
      </article>
    </motion.div>
  );
}
