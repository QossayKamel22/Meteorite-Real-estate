import { BadgeCheck, GraduationCap, Handshake, Quote, ShieldCheck } from "lucide-react";
import { getCeoMessage } from "@/lib/ceo-message";
import Reveal from "@/components/Reveal";

const PILLARS = [
  { icon: ShieldCheck, label: "Trusted" },
  { icon: GraduationCap, label: "Educated" },
  { icon: Handshake, label: "Honest" },
  { icon: BadgeCheck, label: "Experienced" },
];

export default async function CeoMessageSection() {
  const { text, signerTitle, company } = await getCeoMessage();
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand-podcast py-20 sm:py-24">
      <div className="glow-field-podcast" />
      <div className="grain-overlay" />

      {/* Skyline silhouette */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 w-full text-brand-podcast-accent opacity-[0.07] sm:h-36"
        fill="currentColor"
      >
        <path d="M0 160V110h50V70h40v40h30V40h50v70h40V85h30v25h50V55h45v55h35V90h40v20h55V30h50v80h40V75h35v35h50V60h45v50h40V95h30v15h55V45h50v65h40V80h40v30h50V65h45v45h40V100h50v60z" />
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-podcast relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <Quote
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-4 h-36 w-36 rotate-180 text-brand-podcast-accent opacity-[0.08]"
              strokeWidth={1.25}
            />

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-podcast-accent/15 text-brand-podcast-accent ring-1 ring-brand-podcast-accent/30">
                <Quote size={20} strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-podcast-accent">
                A message from our CEO
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-xl font-medium leading-relaxed text-white sm:text-2xl"
                      : "text-base leading-relaxed text-white/70 sm:text-lg"
                  }
                >
                  {p}
                </p>
              ))}
            </div>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {PILLARS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full bg-brand-podcast-accent/10 px-4 py-1.5 text-sm font-medium text-brand-podcast-accent-soft ring-1 ring-brand-podcast-accent/25"
                >
                  <Icon size={14} strokeWidth={1.75} />
                  {label}
                </li>
              ))}
            </ul>

            {(signerTitle || company) && (
              <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
                <span className="h-10 w-1 rounded-full bg-gradient-to-b from-brand-podcast-accent-soft to-brand-podcast-accent" />
                <div>
                  {signerTitle && (
                    <p className="text-base font-semibold text-white">{signerTitle}</p>
                  )}
                  {company && (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-podcast-accent">
                      {company}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
