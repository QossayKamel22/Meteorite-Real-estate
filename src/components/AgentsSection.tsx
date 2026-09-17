import Image from "next/image";
import { BadgeCheck, Crown, Mail, Phone } from "lucide-react";
import { agents, stats, company } from "@/lib/content";
import Reveal from "@/components/Reveal";

const agentCount = stats.find((s) => s.label === "Professional Agents")?.value ?? agents.length;

function AgentCard({
  agent,
  delay,
  featured = false,
}: {
  agent: (typeof agents)[number];
  delay: number;
  featured?: boolean;
}) {
  const isLead = agent.title.toLowerCase().includes("ceo");

  return (
    <Reveal delay={delay} className={featured ? "sm:col-span-2 lg:col-span-1" : undefined}>
      <div
        className={`glass glass-dark shimmer-border group relative flex h-full flex-col items-center overflow-hidden rounded-3xl text-center transition-transform duration-300 hover:-translate-y-1.5 ${
          featured ? "p-9 ring-1 ring-brand-gold/25" : "p-8"
        }`}
      >
        {isLead && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-gold">
            <Crown size={11} /> Founder
          </span>
        )}
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-brand-gold/50 to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
          <div
            className={`relative overflow-hidden rounded-full ring-1 ring-white/15 ${featured ? "h-32 w-32" : "h-28 w-28"}`}
          >
            <Image
              src={agent.photo}
              alt={`Portrait of ${agent.name}`}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-brand-navy ring-2 ring-brand-navy">
            <BadgeCheck size={15} strokeWidth={2.25} />
          </span>
        </div>

        <h3 className={`mt-5 font-semibold text-white ${featured ? "text-xl" : "text-lg"}`}>
          {agent.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-brand-gold">{agent.title}</p>

        <div className="mt-5 flex items-center gap-2">
          <a
            href={`tel:${agent.phone.replace(/\s/g, "")}`}
            aria-label={`Call ${agent.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:bg-brand-gold hover:text-brand-navy"
          >
            <Phone size={15} />
          </a>
          <a
            href={`mailto:${agent.email}`}
            aria-label={`Email ${agent.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:bg-brand-gold hover:text-brand-navy"
          >
            <Mail size={15} />
          </a>
          <a
            href={agent.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1 text-sm font-medium text-white/60 transition-colors group-hover:text-brand-gold"
          >
            Profile <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export default function AgentsSection({ variant = "home" }: { variant?: "home" | "about" }) {
  const isAbout = variant === "about";

  return (
    <section className={`relative overflow-hidden bg-brand-navy ${isAbout ? "py-28" : "py-24"}`}>
      <div className="glow-field" />
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
                {isAbout ? "Leadership & Team" : "Our Team"}
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {isAbout ? "The people behind every deal" : "Meet the agents behind Meteorite"}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/60">
                {agentCount}+ licensed professionals support our clients across Dubai — these are
                the {agents.length} with public profiles today.
              </p>
            </div>
            <div className="glass glass-dark flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80">
              <BadgeCheck size={16} className="text-brand-gold" />
              RERA Verified Brokerage
            </div>
          </div>
        </Reveal>

        <div className={`mt-12 grid gap-6 sm:grid-cols-2 ${isAbout ? "lg:grid-cols-3" : "lg:grid-cols-3"}`}>
          {agents.map((agent, i) => (
            <AgentCard key={agent.name} agent={agent} delay={i * 0.08} featured={isAbout && i === 0} />
          ))}
        </div>

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
