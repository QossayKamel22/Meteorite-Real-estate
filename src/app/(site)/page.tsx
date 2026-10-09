import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import AboutIntro from "@/components/AboutIntro";
import PhotoCollage from "@/components/PhotoCollage";
import PropertyDiscovery from "@/components/PropertyDiscovery";
import FeaturedProjectSection from "@/components/FeaturedProjectSection";
import CeoSection from "@/components/CeoSection";
import CeoMessageSection from "@/components/CeoMessageSection";
import AgentsSection from "@/components/AgentsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactCta from "@/components/ContactCta";
import { getStatsList } from "@/lib/site-stats";
import { getAgents } from "@/lib/agents-data";
import { getTestimonials } from "@/lib/testimonials-data";
import { getHomepageContent } from "@/lib/homepage-content";
import { getGoogleReviews } from "@/lib/google-reviews";
import { getFeaturedProject } from "@/lib/featured-project";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  description:
    "Meteorite Real Estate — a RERA-certified Dubai brokerage since 2005. Buy, sell, lease and manage property across the UAE with trusted, transparent advice.",
  path: "/",
});

export default async function Home() {
  const [stats, agents, testimonials, content, googleReviews, featuredProject] = await Promise.all([
    getStatsList(),
    getAgents(),
    getTestimonials(),
    getHomepageContent(),
    getGoogleReviews(),
    getFeaturedProject(),
  ]);
  const ceo = agents.find((a) => a.bio) ?? agents[0];

  return (
    <>
      <Hero stats={stats} ceo={ceo} testimonials={testimonials} content={content} />
      <StatsSection />
      <AboutIntro />
      <PhotoCollage />
      <PropertyDiscovery />
      <FeaturedProjectSection project={featuredProject} />
      <CeoSection />
      <CeoMessageSection />
      <AgentsSection />
      <TestimonialsSection testimonials={testimonials} google={googleReviews} />
      <ContactCta />
    </>
  );
}
