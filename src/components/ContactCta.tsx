import { company } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function ContactCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-8 py-12 sm:px-14 sm:py-16">
          <div className="glow-field" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to find your next home?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/65">
                Speak with our team directly — call, WhatsApp, or email and we&apos;ll help you
                get the best deal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={company.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-gold px-7 py-3.5 text-center text-[15px] font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform duration-200 hover:scale-[1.03]"
              >
                WhatsApp Us
              </a>
              <a
                href={`tel:${company.phoneE164}`}
                className="glass rounded-full px-7 py-3.5 text-center text-[15px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
              >
                Call {company.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
