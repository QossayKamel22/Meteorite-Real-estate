import { testimonials } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-brand-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Client Feedback
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              What our clients say
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
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
