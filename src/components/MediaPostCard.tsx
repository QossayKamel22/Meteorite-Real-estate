"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Pin } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import type { MediaPost } from "@/lib/media-posts-data";
import MediaVideo from "@/components/MediaVideo";

const EASE = [0.22, 1, 0.36, 1] as const;
const PLATFORM_LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", twitter: "X", youtube: "YouTube", other: "Social" };

/**
 * A Media post. It rises in, its picture is unveiled by a curtain, and it leans toward the
 * pointer with a gold glow beneath. Pinned ("featured") posts also carry a slowly turning gold
 * light around their edge and a shimmering badge.
 */
export default function MediaPostCard({ post, delay, featured = false }: { post: MediaPost; delay: number; featured?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.2 });
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [3.5, -3.5]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-4.5, 4.5]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 46, scale: reduce ? 1 : 0.95 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className="relative h-full [perspective:900px]"
    >
      {featured && !reduce && (
        <span aria-hidden="true" className="pointer-events-none absolute -inset-[2px] overflow-hidden rounded-[1.6rem]">
          <span className="featured-spin absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(219,204,59,0.9)_50deg,transparent_110deg)]" />
        </span>
      )}
      <motion.article
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className={`glass group relative flex h-full flex-col overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-[0_28px_60px_-28px_rgba(219,204,59,0.5)] ${featured ? "bg-surface" : "shimmer-border"}`}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(219,204,59,0.14), transparent 65%)" }} />
        {featured && (
          <span className="absolute right-3 top-3 z-20 flex items-center gap-1 overflow-hidden rounded-full bg-brand-navy/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-gold backdrop-blur">
            <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-[2px] [animation:badge-sheen_3.6s_ease-in-out_infinite]" />
            <Pin size={10} className="relative" /> <span className="relative">Pinned</span>
          </span>
        )}
        {post.video ? (
          <MediaVideo url={post.video} poster={post.image} />
        ) : (
          post.image && (
            <div className={`relative w-full overflow-hidden bg-brand-paper ${post.portrait ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
              <motion.div
                initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
                animate={show ? { clipPath: "inset(0 0 0% 0)" } : undefined}
                transition={{ duration: reduce ? 0 : 1.1, delay: delay + 0.15, ease: EASE }}
                className="absolute inset-0"
              >
                <Image src={post.image} unoptimized={isServedImage(post.image)} alt={post.title} fill className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]" sizes="(min-width: 1024px) 33vw, 50vw" />
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
      </motion.article>
    </motion.div>
  );
}
