import { ArrowUpRight } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-data";
import type { GoogleReviewsSummary } from "@/lib/google-reviews-shared";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ReviewsGrid from "@/components/ReviewsGrid";
import GoogleRatingBadge from "@/components/GoogleRatingBadge";

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
    <section className="relative overflow-hidden bg-brand-paper py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionHeading kicker="Client Feedback" title="What our clients say" />
          </div>
          {showGoogleSummary && (
            <Reveal delay={0.15}>
              <GoogleRatingBadge rating={google.rating} count={reviewCount} url={google.url} />
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
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-soft"
              >
                Read all reviews on Google
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
