import type { Metadata } from "next";
import { LayoutTemplate, MessageSquareQuote } from "lucide-react";
import { getHomepageContent } from "@/lib/homepage-content";
import { getTestimonials } from "@/lib/testimonials-data";
import AdminHomepageContentForm from "@/components/AdminHomepageContentForm";
import AdminTestimonialsPanel from "@/components/AdminTestimonialsPanel";

export const metadata: Metadata = { title: "Homepage · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [content, testimonials] = await Promise.all([
    getHomepageContent(),
    getTestimonials({ includeHidden: true }),
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
            The hero copy and client testimonials shown on the homepage.
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
          <MessageSquareQuote size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
            Testimonials
          </h2>
        </div>
        <p className="mt-2 text-sm text-brand-ink/55">
          Shown in the hero rotator and the &quot;What our clients say&quot; section. Don&apos;t
          invent quotes — only add real client feedback.
        </p>
        <div className="mt-6">
          <AdminTestimonialsPanel testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
