"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { isServedImage } from "@/lib/image-url";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

type Person = { id: string; name: string; title: string; photo: string };

/** A portrait tile that tilts toward the pointer and catches a moving sheen. */
function Tile({ agent, index, show, still }: { agent: Person; index: number; show: boolean; still: boolean }) {
  const isCeo = agent.name === "Saad Abdullah Soboh";
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 180, damping: 18 });
  const sheen = useTransform(px, [-0.5, 0.5], ["-60%", "160%"]);

  return (
    <motion.div
      initial={{ opacity: 0, y: still ? 0 : 46, rotate: still ? 0 : index % 2 ? 4 : -4, scale: still ? 1 : 0.9 }}
      animate={show ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined}
      transition={{ type: "spring", stiffness: 120, damping: 17, delay: 0.5 + index * 0.1 }}
      className="[perspective:700px]"
    >
      <motion.div
        onPointerMove={(e) => {
          if (still) return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={still ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative aspect-square overflow-hidden rounded-2xl shadow-[0_14px_34px_-16px_rgba(13,16,49,0.5)] ring-1 ring-brand-gold/0 transition-shadow duration-300 hover:shadow-[0_22px_44px_-14px_rgba(219,204,59,0.45)] hover:ring-brand-gold/50"
      >
        <Image
          src={agent.photo}
          unoptimized={isServedImage(agent.photo)}
          alt={agent.name}
          fill
          className={`transition-transform duration-700 ease-out group-hover:scale-110 ${isCeo ? "object-contain" : "object-cover object-top"}`}
          sizes="(max-width: 1024px) 30vw, 180px"
        />
        <motion.span aria-hidden="true" style={still ? undefined : { left: sheen }} className="pointer-events-none absolute -top-1/4 h-[150%] w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-[3px] transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/90 to-transparent px-3 pb-2.5 pt-7">
          <p className="truncate text-xs font-semibold text-white">{agent.name.split(" ")[0]}</p>
          <p className="truncate text-[10px] text-brand-gold-soft/90">{agent.title}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Faces & Places: the headline rises word by word; the skyline is unveiled by a curtain
 * that lifts while the picture settles from a slow zoom and drifts with the scroll; the
 * team's portraits arrive one after another and tilt toward the pointer.
 */
export default function PhotoCollageView({ people, companyName }: { people: Person[]; companyName: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.25 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-brand-paper py-16 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2.5">
              <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink">Faces &amp; Places</p>
            </div>
            <MaskWords text="A real team, in the city we know best" show={show} delay={0.1} className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl" />
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
              className="mt-5 max-w-lg text-lg leading-relaxed text-brand-ink/70"
            >
              Every photo here is our own — the skyline we work in every day, and the people you&apos;ll actually speak with. No stock photography, no stand-ins.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={{ duration: 0.8, delay: 0.8 }}>
              <Link prefetch={false} href="/about-us" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-heading transition-colors hover:text-gold-ink">
                Meet the full team
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
              animate={show ? { clipPath: "inset(0 0 0% 0)" } : undefined}
              transition={{ duration: reduce ? 0 : 1.3, ease: EASE }}
              className="group relative aspect-[16/10] overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgba(13,16,49,0.35)]"
            >
              <motion.div style={{ y: drift }} className="absolute -inset-[8%]">
                <motion.div initial={{ scale: reduce ? 1 : 1.3 }} animate={show ? { scale: 1 } : undefined} transition={{ duration: reduce ? 0 : 2.2, ease: EASE }} className="absolute inset-0">
                  <Image src="/brand/hero-dubai-skyline.jpg" alt="Dubai skyline — where Meteorite operates" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 90vw, 600px" />
                </motion.div>
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-brand-navy/5 to-transparent" />
              <motion.p initial={{ opacity: 0, x: -16 }} animate={show ? { opacity: 1, x: 0 } : undefined} transition={{ duration: 0.8, delay: 1.1, ease: EASE }} className="absolute bottom-4 left-5 text-sm font-semibold uppercase tracking-wide text-white">
                Dubai, UAE
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: reduce ? 1 : 0.5, rotate: reduce ? 0 : -12 }}
                animate={show ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
                transition={{ type: "spring", stiffness: 220, damping: 15, delay: 1.2 }}
                className="glass glass-dark absolute right-4 top-4 rounded-full px-4 py-1.5 text-xs font-semibold text-white"
              >
                Since 2005
              </motion.div>
            </motion.div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {people.map((p, i) => (
                <Tile key={p.id} agent={p} index={i} show={show} still={reduce} />
              ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={{ duration: 0.8, delay: 1.3 }} className="mt-4 text-center text-xs text-brand-ink/58">
              {companyName} — {people.length} of our team, in Dubai
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
