import { testimonials } from "@/lib/content";

export default function TestimonialsSection() {
  return (
    <section className="bg-brand-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Client Feedback
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            What our clients say
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-brand-line bg-white p-7 shadow-[0_1px_2px_rgba(13,16,49,0.04)]"
            >
              <blockquote className="text-[15px] leading-relaxed text-brand-ink/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold text-brand-navy">
                {t.name}
                <span className="ml-1.5 font-normal text-brand-ink/50">— {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
