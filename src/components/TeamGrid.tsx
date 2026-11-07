"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight, Crown, ExternalLink, Mail, Phone, X } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import { brokerCardOf, profileSheetOf, qualificationsOf, type CardCert, type TeamMember } from "@/lib/team-cards";
import BusinessCard from "@/components/BusinessCard";
import ImageLightbox from "@/components/ImageLightbox";

const EASE = [0.22, 1, 0.36, 1] as const;
const noSub = () => () => {};

type Company = { website: string; address: string; orn: string; email: string };

function Dialog({ people, index, setIndex, onClose, certs, company }: { people: TeamMember[]; index: number; setIndex: (i: number) => void; onClose: () => void; certs: Record<string, CardCert[]>; company: Company }) {
  const n = people.length;
  const m = people[index];
  const ref = useRef<HTMLDivElement>(null);
  const go = useCallback((d: number) => setIndex((index + d + n) % n), [index, n, setIndex]);
  const mine = certs[m.id] ?? [];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [go, onClose]);

  const paragraphs = (t?: string) => (t ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const sheet = profileSheetOf(m);
  const savedAbout = Boolean(m.bio || m.background || (m.credentials && m.credentials.length));
  const aboutText = savedAbout ? [...paragraphs(m.bio).slice(0, 2), ...paragraphs(m.background).slice(0, 1)] : sheet?.about ?? [];
  const badges = savedAbout ? m.credentials ?? [] : sheet?.credentials ?? [];
  const hasAbout = aboutText.length > 0 || badges.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center bg-[#05061a]/85 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${m.name}, ${m.title}`}>
      <motion.div ref={ref} tabIndex={-1} initial={{ y: 50, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} onClick={(e) => e.stopPropagation()} className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-t-3xl bg-surface p-5 shadow-2xl outline-none sm:rounded-3xl sm:p-8">
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
          {n > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Previous person" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink/[0.07] text-heading hover:bg-brand-gold hover:text-brand-navy"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next person" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink/[0.07] text-heading hover:bg-brand-gold hover:text-brand-navy"><ChevronRight size={18} /></button>
            </>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink/[0.07] text-heading hover:bg-red-500 hover:text-white"><X size={18} /></button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={m.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: EASE }} className="grid gap-8 pt-8 sm:pt-2 md:grid-cols-[minmax(0,22rem)_1fr]">
            <BusinessCard c={{ name: m.name, title: m.title, qualifications: qualificationsOf(m), photo: m.photo, phone: m.phone, email: m.email, companyEmail: company.email, website: company.website, address: company.address, brokerCard: brokerCardOf(m), orn: company.orn }} />

            <div className="min-w-0 md:pt-8">
              <h2 className="text-xl font-semibold tracking-tight text-heading">{m.name}</h2>
              <p className="mt-0.5 text-sm font-medium text-gold-ink">{m.title}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.phone && <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy"><Phone size={14} /> Call</a>}
                <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-brand-line px-4 py-2 text-sm font-semibold text-heading hover:border-brand-gold"><Mail size={14} /> Email</a>
                {m.profileUrl && <a href={m.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-brand-line px-4 py-2 text-sm font-semibold text-heading hover:border-brand-gold"><ExternalLink size={14} /> Profile</a>}
              </div>

              {hasAbout && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/65">About</h3>
                  <div className="mt-2 space-y-2.5 text-sm leading-relaxed text-brand-ink/80">
                    {aboutText.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                  {badges.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {badges.map((c) => <li key={c} className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-medium text-heading">{c}</li>)}
                    </ul>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/65"><BadgeCheck size={14} className="text-gold-ink" /> {mine.length === 0 && sheet ? "Qualifications" : "Certificates"}</h3>
                {mine.length > 0 ? (
                  <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                    {mine.flatMap((c) => c.images.map((src, k) => ({ c, src, k }))).map(({ c, src, k }) => (
                      <li key={`${c.id}-${k}`}>
                        <ImageLightbox src={src} alt={`${c.title} — ${m.name}`}>
                          <span className="relative block aspect-[1289/907] overflow-hidden rounded-xl bg-brand-paper ring-1 ring-brand-line">
                            <Image src={src} alt={`${c.title} — ${m.name}`} fill sizes="260px" unoptimized={isServedImage(src)} className="object-cover" />
                          </span>
                        </ImageLightbox>
                        <p className="mt-1.5 text-xs font-semibold text-heading">{c.title}{c.images.length > 1 ? ` (${k + 1}/${c.images.length})` : ""}</p>
                        <p className="text-[11px] text-brand-ink/65">{c.licenseNo ? `No. ${c.licenseNo}` : ""}{c.registrationDate ? ` · ${c.registrationDate} — ${c.expiryDate ?? ""}` : ""}</p>
                      </li>
                    ))}
                  </ul>
                ) : sheet ? (
                  <div className="mt-3">
                    <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(160deg,#10163f,#0a0e2c)] p-5 text-[#f4eddc] ring-1 ring-brand-line sm:p-6">
                      <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-lg border border-[#e2c070]/60" />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-3.5 rounded-md border border-[#e2c070]/25" />
                      <div className="relative text-center">
                        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#e2c070] text-[#e2c070]"><BadgeCheck size={18} /></span>
                        <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#e2c070]">Professional qualifications</p>
                        <p className="mt-1 bg-gradient-to-b from-[#f4dc98] to-[#c89a48] bg-clip-text text-lg font-semibold text-transparent">{m.name}</p>
                        <span aria-hidden="true" className="mx-auto mt-2.5 block h-px w-28 bg-gradient-to-r from-transparent via-[#e2c070] to-transparent" />
                      </div>
                      <div className="relative mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-3">
                        {sheet.groups.map((g) => (
                          <div key={g.heading} className="text-center sm:text-left">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#e2c070]">{g.heading}</p>
                            <ul className="mt-2 space-y-2">
                              {g.items.map((it) => (
                                <li key={it.title}>
                                  <p className="text-[12.5px] font-semibold leading-snug text-[#f4eddc]">{it.title}</p>
                                  {it.sub && <p className="text-[10.5px] leading-snug text-[#f4eddc]/65">{it.sub}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-brand-ink/65">{brokerCardOf(m) ? `Broker card #${brokerCardOf(m)}, registered with the Dubai Land Department (RERA). The certificate has not been uploaded yet.` : "No certificate has been published for this team member yet."}</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/**
 * The "Our Team" grid. Each card is a button: tapping it opens a dialog with that person's business card,
 * their certificates (matched by broker card number) and, when entered in the admin, a short profile.
 */
export default function TeamGrid({ people, certs, company }: { people: TeamMember[]; certs: Record<string, CardCert[]>; company: Company }) {
  const [open, setOpen] = useState<number | null>(null);
  const isClient = useSyncExternalStore(noSub, () => true, () => false);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {people.map((a, i) => {
          const lead = /\bceo\b/i.test(a.title);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open ${a.name}'s card`}
                className="glass glass-dark shimmer-border group relative flex h-full w-full flex-col items-center overflow-hidden rounded-3xl p-6 text-center transition-transform duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                {lead && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-gold"><Crown size={11} /> Founder</span>
                )}
                <span className="relative block">
                  <span aria-hidden="true" className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-brand-gold/50 to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative block h-28 w-28 overflow-hidden rounded-full ring-1 ring-white/15">
                    <Image src={a.photo} unoptimized={isServedImage(a.photo)} alt={`Portrait of ${a.name}`} fill sizes="112px" className="object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                  </span>
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-brand-navy ring-2 ring-brand-navy"><BadgeCheck size={15} strokeWidth={2.25} /></span>
                </span>
                <span className="mt-5 text-lg font-semibold text-white">{a.name}</span>
                <span className="mt-2 max-w-full whitespace-nowrap rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-gold">{a.title}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition-colors group-hover:text-brand-gold">View card &amp; certificates <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
              </button>
            </motion.div>
          );
        })}
      </div>
      {isClient && createPortal(<AnimatePresence>{open !== null && <Dialog people={people} index={open} setIndex={setOpen} onClose={close} certs={certs} company={company} />}</AnimatePresence>, document.body)}
    </>
  );
}
