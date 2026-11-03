"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS: Record<string, LucideIcon> = { phone: Phone, whatsapp: MessageCircle, mail: Mail };

export type ContactAction = { key: "phone" | "whatsapp" | "mail"; label: string; value: string; href: string; external?: boolean };

/** One way to reach us: a card that leans toward the pointer, glows under it, and whose icon comes alive on hover. */
function ActionCard({ a, index, still }: { a: ContactAction; index: number; still: boolean }) {
  const Icon = ICONS[a.key];
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 18 });
  const hover = a.key === "phone" ? "group-hover:[animation:contact-ring_0.7s_ease-in-out_2]" : a.key === "whatsapp" ? "group-hover:scale-110" : "group-hover:-translate-y-0.5 group-hover:-rotate-6";

  return (
    <motion.li
      initial={{ opacity: 0, y: still ? 0 : 50, scale: still ? 1 : 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.9 + index * 0.12, ease: EASE }}
      className="[perspective:800px]"
    >
      <motion.a
        href={a.href}
        target={a.external ? "_blank" : undefined}
        rel={a.external ? "noopener noreferrer" : undefined}
        onPointerMove={(e) => {
          if (still) return;
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
        style={still ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] p-6 text-center backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 hover:border-brand-gold/60 hover:bg-white/[0.09] hover:shadow-[0_26px_60px_-26px_rgba(219,204,59,0.55)]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), rgba(219,204,59,0.2), transparent 65%)" }} />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
          <Icon size={21} strokeWidth={1.75} className={`transition-transform duration-300 ${hover}`} />
        </span>
        <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-white">{a.label}</p>
        <p className="relative break-all text-sm text-white/65 transition-colors group-hover:text-white">{a.value}</p>
      </motion.a>
    </motion.li>
  );
}

/**
 * The Contact page opening: a night skyline that drifts with the scroll under a dark grade,
 * meteorites crossing the sky, a headline that rises word by word, and the three direct
 * channels as cards that lean toward the pointer.
 */
export default function ContactHero({ actions }: { actions: ContactAction[] }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-brand-navy py-20 sm:py-28">
      <motion.div aria-hidden="true" style={{ y }} className="absolute -inset-x-4 -top-8 bottom-0 -z-20">
        <Image src="/brand/hero/dubai-night-skyline.jpg" alt="" fill priority sizes="100vw" className={`object-cover opacity-70 ${reduce ? "" : "ken-burns"}`} />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(8,10,34,0.72),rgba(8,10,34,0.55)_45%,rgba(13,16,49,0.96))]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,5,20,0.65)_100%)]" />
      <div className="grain-overlay" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="shooting-star left-[8%] top-[14%]" />
        <span className="shooting-star left-[38%] top-[6%]" style={{ animationDelay: "3.4s", animationDuration: "11s" }} />
        <span className="shooting-star left-[62%] top-[22%]" style={{ animationDelay: "6.1s", animationDuration: "10s" }} />
      </div>

      <motion.div style={{ opacity: fade }} className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5">
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE }} style={{ transformOrigin: "right" }} className="h-px w-10 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-gold">Contact Us</span>
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-10 bg-brand-gold" />
        </div>
        <MaskWords as="h1" text="We'd love to hear from you" show delay={0.15} className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] sm:text-6xl" />
        <motion.p initial={{ opacity: 0, y: reduce ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7, ease: EASE }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Buying, selling, renting or just curious about the market? Reach our team directly, or leave a message and we&apos;ll come back to you.
        </motion.p>

        <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {actions.map((a, i) => (
            <ActionCard key={a.key} a={a} index={i} still={reduce} />
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
