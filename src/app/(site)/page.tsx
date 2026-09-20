import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import AboutIntro from "@/components/AboutIntro";
import PhotoCollage from "@/components/PhotoCollage";
import PropertyDiscovery from "@/components/PropertyDiscovery";
import CeoSection from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactCta from "@/components/ContactCta";
import { getStatsList } from "@/lib/site-stats";
import { getAgents } from "@/lib/agents-data";
import { getTestimonials } from "@/lib/testimonials-data";
import { getHomepageContent } from "@/lib/homepage-content";

export default async function Home() {
  const [stats, agents, testimonials, content] = await Promise.all([
    getStatsList(),
    getAgents(),
    getTestimonials(),
    getHomepageContent(),
  ]);
  const ceo = agents.find((a) => a.bio) ?? agents[0];

  return (
    <>
      <Hero stats={stats} ceo={ceo} testimonials={testimonials} content={content} />
      <StatsSection />
      <AboutIntro />
      <PhotoCollage />
      <PropertyDiscovery />
      <CeoSection />
      <AgentsSection />
      <TestimonialsSection testimonials={testimonials} />
      <ContactCta />
    </>
  );
}
