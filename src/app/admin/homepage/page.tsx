import type { Metadata } from "next";
import { Building2, LayoutTemplate, MessageSquareQuote, Quote } from "lucide-react";
import { getHomepageContent } from "@/lib/homepage-content";
import { getCeoMessage } from "@/lib/ceo-message";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getFeaturedProjects } from "@/lib/featured-projects-data";
import { getTestimonials } from "@/lib/testimonials-data";
import AdminHomepageContentForm from "@/components/AdminHomepageContentForm";
import AdminCeoMessageForm from "@/components/AdminCeoMessageForm";
import AdminGoogleReviewsForm from "@/components/AdminGoogleReviewsForm";
import AdminFeaturedProjectsPanel from "@/components/AdminFeaturedProjectsPanel";
import AdminTestimonialsPanel from "@/components/AdminTestimonialsPanel";

export const metadata: Metadata = { title: "Homepage · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [content, ceoMessage, testimonials, googleReviews, featuredProjects] = await Promise.all([
    getHomepageContent(),
    getCeoMessage(),
    getTestimonials({ includeHidden: true }),
    getGoogleReviews(),
    getFeaturedProjects({ includeHidden: true }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <LayoutTemplate size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Homepage</h1>
          <p className="text-sm text-brand-ink/55">
            The hero copy, CEO message, featured project and client testimonials shown on the homepage.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">Hero section</h2>
        <div className="mt-4">
          <AdminHomepageContentForm content={content} />
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Quote size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
            CEO message
          </h2>
        </div>
        <p className="mt-2 text-sm text-brand-ink/55">
          The signed message shown on the homepage below the leadership section. Up to 200 words.
        </p>
        <div className="mt-6">
          <AdminCeoMessageForm message={ceoMessage} />
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
            Featured projects
          </h2>
        </div>
        <p className="mt-2 text-sm text-brand-ink/55">
          The editorial project panel on the homepage, below the listings. Add as many projects as you
          like — with two or more it becomes a swipeable carousel that advances by itself. The order
          below is the order on the site.
        </p>
        <div className="mt-6">
          <AdminFeaturedProjectsPanel projects={featuredProjects} />
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <MessageSquareQuote size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
            Testimonials
          </h2>
        </div>
        <p className="mt-2 text-sm text-brand-ink/55">
          Shown in the hero rotator and the &quot;What our clients say&quot; section on the homepage,
          which shows the first 6 (use the arrows to choose which) and reveals the rest with a
          &quot;See more reviews&quot; button. Long reviews are shortened with a &quot;Read more&quot; button. Don&apos;t invent quotes — only add real client feedback.
        </p>

        <div className="mt-6 rounded-2xl border border-brand-line p-5">
          <h3 className="text-sm font-semibold text-heading">Google reviews summary</h3>
          <p className="mt-1 mb-4 text-xs text-brand-ink/50">
            The rating and review count shown beside the Google icon, and where the &quot;Read all reviews on Google&quot; button goes.
          </p>
          <AdminGoogleReviewsForm
            summary={googleReviews}
            autoCount={testimonials.filter((t) => t.source === "google" && t.visible !== false).length}
          />
        </div>

        <div className="mt-6">
          <AdminTestimonialsPanel testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
