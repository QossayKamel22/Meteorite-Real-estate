"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Award, CalendarCheck, FileCheck2, ShieldCheck, type LucideIcon } from "lucide-react";
import CertificateGallery from "@/components/CertificateGallery";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

type Cert = { id: string; title: string; images: string[]; licenseNo?: string; registrationDate?: string; expiryDate?: string; activities?: string[]; issuer?: string };
type Item = { label: string; value: string; Icon: LucideIcon };

/** "dd/mm/yyyy" (or d/m/yyyy) to a Date; null when it isn't in that shape. */
function parseDate(v?: string): Date | null {
  const m = v?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** How much of the registration period has passed (0-1), or null if the dates aren't usable. */
function elapsed(from?: string, to?: string): number | null {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!a || !b || b <= a) return null;
  return Math.max(0, Math.min(1, (Date.now() - a.getTime()) / (b.getTime() - a.getTime())));
}

/** The certificate picture in a frame that leans toward the pointer and catches a travelling sheen. */
function TiltFrame({ children, still }: { children: React.ReactNode; still: boolean }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 160, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 160, damping: 20 });
  const sheen = useTransform(px, [-0.5, 0.5], ["-40%", "140%"]);
  return (
    <div className="[perspective:1000px]">
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
        className="group relative"
      >
        {children}
        {!still && <motion.span aria-hidden="true" style={{ left: sheen }} className="pointer-events-none absolute -top-[10%] h-[120%] w-1/4 -skew-x-12 bg-white/30 opacity-0 blur-[6px] transition-opacity duration-300 group-hover:opacity-100" />}
      </motion.div>
    </div>
  );
}

/**
 * One certificate: the picture in a tilting frame that is unveiled by a curtain, beside its
 * details, which are joined by a gold thread and arrive one after another. When the dates
 * can be read, a bar shows how much of the registration period has run.
 */
export default function CertificateShowcase({ cert, first, index }: { cert: Cert; first: boolean; index: number }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });
  const items: Item[] = [{ label: "Title", value: cert.title, Icon: FileCheck2 }];
  if (cert.licenseNo) items.push({ label: "License No.", value: cert.licenseNo, Icon: ShieldCheck });
  if (cert.registrationDate || cert.expiryDate) items.push({ label: "Registered · Expires", value: `${cert.registrationDate ?? ""} — ${cert.expiryDate ?? ""}`, Icon: CalendarCheck });
  if (cert.activities && cert.activities.length > 0) items.push({ label: "Activities", value: cert.activities.join(" · "), Icon: Award });
  const used = elapsed(cert.registrationDate, cert.expiryDate);

  return (
    <div ref={ref}>
      {first && (
        <div className="mt-20 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "right" }} className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink">Official Registration</span>
            <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
          </div>
          <MaskWords text="Our certificates" show={show} delay={0.1} className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl" />
        </div>
      )}

      <div className={`grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center ${first ? "mt-10" : "mt-16"}`}>
        <motion.div
          initial={{ clipPath: reduce ? "inset(0 0 0 0 round 1.5rem)" : "inset(0 100% 0 0 round 1.5rem)", opacity: 0 }}
          animate={show ? { clipPath: "inset(0 0% 0 0 round 1.5rem)", opacity: 1 } : undefined}
          transition={{ duration: reduce ? 0 : 1.2, delay: 0.15, ease: EASE }}
        >
          <TiltFrame still={reduce}>
            <CertificateGallery images={cert.images} title={cert.title} />
          </TiltFrame>
        </motion.div>

        <div className="relative">
          <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-px bg-brand-gold/20" />
          <motion.span aria-hidden="true" initial={{ scaleY: 0 }} animate={show ? { scaleY: 1 } : undefined} transition={{ duration: 1.6, delay: 0.4, ease: EASE }} style={{ transformOrigin: "top" }} className="absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-brand-gold-soft to-brand-gold shadow-[0_0_10px_1px_rgba(219,204,59,0.5)]" />
          <ul className="relative space-y-3.5">
            {items.map(({ label, value, Icon }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: reduce ? 0 : 36 }}
                animate={show ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.85, delay: 0.35 + i * 0.13 + index * 0.05, ease: EASE }}
                className="relative pl-14"
              >
                <motion.span
                  initial={{ scale: reduce ? 1 : 0 }}
                  animate={show ? { scale: 1 } : undefined}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.5 + i * 0.13 }}
                  className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-paper text-brand-gold shadow-[0_0_18px_-2px_rgba(219,204,59,0.5)]"
                >
                  <Icon size={17} strokeWidth={1.8} />
                </motion.span>
                <div className="glass shimmer-border rounded-2xl px-5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-1 hover:shadow-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/65">{label}</p>
                  <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">{value}</p>
                  {label.startsWith("Registered") && used !== null && (
                    <div className="mt-3" aria-label={`${Math.round(used * 100)}% of the registration period has passed`}>
                      <div className="h-1 overflow-hidden rounded-full bg-brand-line">
                        <motion.div initial={{ scaleX: 0 }} animate={show ? { scaleX: used } : undefined} transition={{ duration: 1.6, delay: 0.9, ease: EASE }} style={{ transformOrigin: "left" }} className="h-full w-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-soft" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
          {cert.issuer && <p className="relative mt-3 pl-14 text-xs text-brand-ink/62">Issued by {cert.issuer}. Click the certificate to view full size.</p>}
        </div>
      </div>
    </div>
  );
}
