import type { Testimonial } from "@/lib/testimonials-data";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <SectionHeading kicker="Client Feedback" title="What our clients say" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <figure className="glass shimmer-border h-full rounded-2xl p-7">
                <blockquote className="text-[15px] leading-relaxed text-brand-ink/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-heading">
                  {t.name}
                  <span className="ml-1.5 font-normal text-brand-ink/50">— {t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
