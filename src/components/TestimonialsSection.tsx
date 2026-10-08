import { ArrowUpRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-data";
import type { GoogleReviewsSummary } from "@/lib/google-reviews-shared";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ReviewsGrid from "@/components/ReviewsGrid";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className="text-brand-gold" fill={n <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </div>
  );
}

export default function TestimonialsSection({
  testimonials,
  google,
}: {
  testimonials: Testimonial[];
  google: GoogleReviewsSummary;
}) {
  if (testimonials.length === 0) return null;

  const googleReviews = testimonials.filter((t) => t.source === "google");
  // The admin-entered Google total wins; until one is set, count the Google reviews added to the site.
  const reviewCount = google.count ?? googleReviews.length;
  const showGoogleSummary = reviewCount > 0;

  return (
    <section className="relative overflow-hidden bg-brand-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionHeading kicker="Client Feedback" title="What our clients say" />
          </div>
          {showGoogleSummary && (
            <Reveal delay={0.15}>
              <a
                href={google.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
              >
                <p className="text-2xl font-semibold tracking-tight text-heading">{google.rating.toFixed(1)}</p>
                <div>
                  <StarRow rating={Math.round(google.rating)} />
                  <p className="mt-0.5 text-xs text-brand-ink/50">
                    {reviewCount} review{reviewCount === 1 ? "" : "s"}
                  </p>
                </div>
              </a>
            </Reveal>
          )}
        </div>

        <ReviewsGrid testimonials={testimonials} />

        {showGoogleSummary && (
          <Reveal delay={0.1}>
            <div className="mt-6 flex justify-center">
              <a
                href={google.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
              >
                Read all {reviewCount} reviews on Google
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
