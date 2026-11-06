import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faq";

/**
 * Frequently asked questions as plain <details> elements: no JavaScript at all, keyboard and screen-reader
 * friendly, and marked up as a FAQPage for search engines.
 */
export default function FaqSection({ title = "Good to know", items }: { title?: string; items: Faq[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <section aria-label="Frequently asked questions" className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">{title}</h2>
      <div className="mt-5 divide-y divide-brand-line overflow-hidden rounded-2xl border border-brand-line bg-surface">
        {items.map((i) => (
          <details key={i.q} className="faq group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-heading transition-colors hover:bg-brand-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold [&::-webkit-details-marker]:hidden">
              {i.q}
              <ChevronDown size={18} className="flex-none text-gold-ink transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-brand-ink/72">{i.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </section>
  );
}
