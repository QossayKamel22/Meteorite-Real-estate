import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-data";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className="text-brand-gold" fill={n <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </div>
  );
}

/** A small four-dot mark nodding at Google's brand colors, not a reproduction of the Google logo. */
function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-ink/60 shadow-sm ring-1 ring-black/5">
      <span className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
      </span>
      Google Review
    </span>
  );
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  const googleReviews = testimonials.filter((t) => t.source === "google");
  const ratedPool = googleReviews.length > 0 ? googleReviews : testimonials;
  const avgRating = ratedPool.reduce((sum, t) => sum + (t.rating ?? 5), 0) / ratedPool.length;

  return (
    <section className="relative overflow-hidden bg-brand-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionHeading kicker="Client Feedback" title="What our clients say" />
          </div>
          {googleReviews.length > 0 && (
            <Reveal delay={0.15}>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
                <p className="text-2xl font-semibold tracking-tight text-heading">{avgRating.toFixed(1)}</p>
                <div>
                  <StarRow rating={Math.round(avgRating)} />
                  <p className="mt-0.5 text-xs text-brand-ink/50">
                    From {googleReviews.length} Google review{googleReviews.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <figure className="glass shimmer-border group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <Quote
                  size={64}
                  strokeWidth={1}
                  className="pointer-events-none absolute -right-2 -top-2 text-brand-gold/10 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="relative flex items-center justify-between gap-2">
                  <StarRow rating={t.rating ?? 5} />
                  {t.source === "google" && <GoogleBadge />}
                </div>
                <blockquote className="relative mt-4 flex-1 text-[15px] leading-relaxed text-brand-ink/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="relative mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                    {initials(t.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-heading">{t.name}</span>
                    <span className="block text-xs font-normal text-brand-ink/50">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
