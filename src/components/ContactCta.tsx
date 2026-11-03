import { getAgents } from "@/lib/agents-data";
import ContactCtaView from "@/components/ContactCtaView";

/** The closing "Let's talk" panel, with the founder's face on it so the first call has a name. */
export default async function ContactCta() {
  const agents = await getAgents();
  const lead = agents.find((a) => /\bceo\b/i.test(a.title)) ?? agents[0];
  return <ContactCtaView person={lead ? { name: lead.name, title: lead.title, photo: lead.photo } : undefined} />;
}
