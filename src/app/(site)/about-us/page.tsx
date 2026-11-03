import type { Metadata } from "next";
import { company } from "@/lib/content";
import PageHero from "@/components/PageHero";
import StatsShowcase from "@/components/StatsShowcase";
import { getStatsList } from "@/lib/site-stats";
import { LeadershipSpread } from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";
import ContactCta from "@/components/ContactCta";
import RegistrationDetails from "@/components/RegistrationDetails";
import DevelopersAndCertificate from "@/components/DevelopersAndCertificate";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: company.legalTagline,
  path: "/about-us",
});

export default async function AboutUsPage() {
  const stats = await getStatsList();
  return (
    <div>
      <PageHero
        image="/brand/hero/burj-khalifa-storm.jpg"
        kicker="About Us"
        title={company.name}
        text={company.legalTagline}
        chips={[{ label: "Trusted since 2005" }, { label: `RERA ORN ${company.orn}` }, { label: `Broker Card #${company.brokerCard}` }]}
      >
        <StatsShowcase embedded stats={stats.map((x) => ({ label: x.label, value: x.value }))} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <RegistrationDetails address={company.address} poBox={company.poBox} orn={company.orn} brokerCard={company.brokerCard} />
      </section>

      <DevelopersAndCertificate />

      <LeadershipSpread />
      <AgentsSection variant="about" />
      <ContactCta />
    </div>
  );
}
