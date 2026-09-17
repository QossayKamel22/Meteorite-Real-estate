import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import AboutIntro from "@/components/AboutIntro";
import PhotoCollage from "@/components/PhotoCollage";
import PropertyDiscovery from "@/components/PropertyDiscovery";
import CeoSection from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactCta from "@/components/ContactCta";
import SkylineDivider from "@/components/SkylineDivider";

export default function Home() {
  return (
    <>
      <Hero />
      <SkylineDivider className="bg-brand-paper" />
      <StatsSection />
      <AboutIntro />
      <PhotoCollage />
      <PropertyDiscovery />
      <CeoSection />
      <AgentsSection />
      <SkylineDivider flip className="bg-brand-paper" />
      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
