"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-data";
import Reveal from "@/components/Reveal";
import ReviewCard from "@/components/ReviewCard";

/** Reviews visible before "See more" is pressed. */
const INITIAL_COUNT = 6;

export default function ReviewsGrid({ testimonials }: { testimonials: Testimonial[] }) {
  const [expanded, setExpanded] = useState(false);
  const gridId = useId();
  const hiddenCount = Math.max(0, testimonials.length - INITIAL_COUNT);
  // The extra cards aren't rendered at all until requested, so they add nothing to the page weight.
  const visible = expanded ? testimonials : testimonials.slice(0, INITIAL_COUNT);

  return (
    <>
      <div id={gridId} className="mt-12 grid items-start gap-6 md:grid-cols-3">
        {visible.map((t, i) => (
          <Reveal key={t.id} delay={(i % INITIAL_COUNT) * 0.08}>
            <ReviewCard t={t} />
          </Reveal>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={gridId}
            className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-6 py-3 text-[15px] font-semibold text-heading shadow-sm transition-colors hover:border-brand-gold hover:text-brand-gold"
          >
            {expanded ? "Show fewer reviews" : `See more reviews (${hiddenCount})`}
            <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </>
  );
}
