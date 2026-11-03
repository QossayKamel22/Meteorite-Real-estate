"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { company } from "@/lib/content";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ["BUY", "RENT", "SELL", "MANAGE", "INVEST"];

/** A button that drifts toward the pointer while it is over it. */
function Magnetic({ children, still }: { children: React.ReactNode; still: boolean }) {
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  return (
    <motion.div
      style={still ? undefined : { x, y }}
      onPointerMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * 16);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 12);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * "Ready to find your next home?": a dark panel with a slow aurora, a ghost line of BUY · RENT ·
 * SELL scrolling behind the text, a skyline that rises as the panel scrolls into view, a headline
 * that climbs out of a mask word by word, and two buttons that lean toward the pointer —
 * WhatsApp pulses, the phone number rings its handset.
 */
export default function ContactCta() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rise = useTransform(scrollYProgress, [0, 0.6], reduce ? ["0%", "0%"] : ["40%", "0%"]);
  const ghost = [...WORDS, ...WORDS];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: reduce ? 0 : 50, scale: reduce ? 1 : 0.97 }}
        animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 1, ease: EASE }}
        className="relative isolate overflow-hidden rounded-[2rem] bg-brand-navy px-8 py-12 sm:px-14 sm:py-16"
      >
        <div className="cta-aurora absolute inset-0 -z-10" aria-hidden="true" />
        <div className="grain-overlay" />

        {/* a ghost line of services drifting behind everything */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 overflow-hidden opacity-[0.07]">
          <div className={`flex w-max gap-10 whitespace-nowrap text-[7rem] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_#fff] ${reduce ? "" : "marquee-track"}`} style={reduce ? undefined : { animationDuration: "50s" }}>
            {ghost.map((w, i) => (
              <span key={i}>{w} ·</span>
            ))}
          </div>
        </div>

        {/* the skyline, rising */}
        <motion.svg aria-hidden="true" style={{ y: rise }} viewBox="0 0 1200 160" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-2 bottom-0 -z-10 h-28 w-[101%] text-brand-gold opacity-[0.12] sm:h-36" fill="currentColor">
          <path d="M0 160V110h50V70h40v40h30V40h50v70h40V85h30v25h50V55h45v55h35V90h40v20h55V30h50v80h40V75h35v35h50V60h45v50h40V95h30v15h55V45h50v65h40V80h40v30h50V65h45v45h40V100h50v60z" />
        </motion.svg>

        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Let&apos;s talk</span>
            </div>
            <MaskWords text="Ready to find your next home?" show={show} delay={0.15} className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl" />
            <motion.p initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.6, ease: EASE }} className="mt-3 text-base leading-relaxed text-white/65">
              Speak with our team directly — call, WhatsApp, or email and we&apos;ll help you get the best deal.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, x: reduce ? 0 : 40 }} animate={show ? { opacity: 1, x: 0 } : undefined} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="flex flex-col gap-3 sm:flex-row">
            <Magnetic still={reduce}>
              <a
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-gold px-7 py-3.5 text-center text-[15px] font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_40px_-8px_rgba(219,204,59,0.85)]"
              >
                {!reduce && <span aria-hidden="true" className="cta-pulse pointer-events-none absolute inset-0 rounded-full" />}
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/45 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[130%] group-hover:opacity-100" />
                <MessageCircle size={17} className="relative transition-transform duration-300 group-hover:scale-110" />
                <span className="relative">WhatsApp Us</span>
              </a>
            </Magnetic>
            <Magnetic still={reduce}>
              <a
                href={`tel:${company.phoneE164}`}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-7 py-3.5 text-center text-[15px] font-semibold text-white backdrop-blur transition-colors duration-300 hover:border-brand-gold/70 hover:bg-white/[0.12]"
              >
                <Phone size={16} className="text-brand-gold group-hover:[animation:contact-ring_0.7s_ease-in-out_2]" />
                Call {company.phoneDisplay}
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
