import { BadgeCheck } from "lucide-react";
import { company, SITE_URL } from "@/lib/content";
import { getStats } from "@/lib/site-stats";
import { getAgents } from "@/lib/agents-data";
import { getCertificates } from "@/lib/certificates-data";
import { certsFor, type CardCert } from "@/lib/team-cards";
import TeamGrid from "@/components/TeamGrid";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export default async function AgentsSection({ variant = "home" }: { variant?: "home" | "about" }) {
  const isAbout = variant === "about";
  const [stats, agents, certificates] = await Promise.all([getStats(), getAgents(), getCertificates()]);
  const cardCerts: CardCert[] = certificates.map((c) => ({ id: c.id, title: c.title, licenseNo: c.licenseNo, registrationDate: c.registrationDate, expiryDate: c.expiryDate, activities: c.activities, images: c.images }));
  const certs = Object.fromEntries(agents.map((a) => [a.id, certsFor(a, cardCerts)]));
  const agentCount = stats.professionalAgents;

  return (
    <section className={`relative overflow-hidden bg-brand-navy ${isAbout ? "py-28" : "py-24"}`}>
      <div className="glow-field" />
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionHeading
              kicker={isAbout ? "Leadership & Team" : "Our Team"}
              title={isAbout ? "The people behind every deal" : "Meet the agents behind Meteorite"}
              theme="light"
              titleClassName="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl"
            />
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/60">
                {agentCount}+ licensed professionals support our clients across Dubai — meet the
                {" "}{agents.length} team members with public profiles today.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="glass glass-dark flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80">
              <BadgeCheck size={16} className="text-brand-gold" />
              RERA Verified Brokerage
            </div>
          </Reveal>
        </div>

        <TeamGrid
          people={agents.map((a) => ({ id: a.id, name: a.name, title: a.title, photo: a.photo, email: a.email, phone: a.phone, bio: a.bio, background: a.background, credentials: a.credentials, brokerCard: a.brokerCard, qualifications: a.qualifications, profileUrl: a.profileUrl }))}
          certs={certs}
          company={{ email: company.email, website: SITE_URL.replace(/^https?:\/\//, ""), address: company.address, orn: company.orn }}
        />

        <Reveal delay={0.24}>
          <p className="mt-8 text-center text-sm text-white/45">
            Want to speak with the wider team?{" "}
            <a href={company.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-gold hover:underline">
              WhatsApp us
            </a>{" "}
            and we&apos;ll connect you with the right agent.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
