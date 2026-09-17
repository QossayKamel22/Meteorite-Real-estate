import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import AboutIntro from "@/components/AboutIntro";
import PropertyDiscovery from "@/components/PropertyDiscovery";
import CeoSection from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactCta from "@/components/ContactCta";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <AboutIntro />
      <PropertyDiscovery />
      <CeoSection />
      <AgentsSection />
      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
