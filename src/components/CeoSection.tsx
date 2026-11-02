import { getAgents } from "@/lib/agents-data";
import { getCeoMessage } from "@/lib/ceo-message";
import LeadershipCarousel from "@/components/LeadershipCarousel";
import LeadershipStack from "@/components/LeadershipStack";

/**
 * The Leadership section. Everyone with a Leadership bio (set per person in
 * Admin > Team) is shown, in team order: one leader on their own, several as a
 * horizontal carousel. Falls back to the first team member if nobody has a bio yet.
 */
export default async function CeoSection() {
  const agents = await getAgents();
  const withBio = agents.filter((a) => a.bio);
  const leaders = withBio.length > 0 ? withBio : agents.slice(0, 1);
  if (leaders.length === 0) return null;
  const { text, signerTitle, company } = await getCeoMessage();
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return <LeadershipCarousel leaders={leaders} message={paragraphs.length > 0 ? { paragraphs, signerTitle, company } : undefined} />;
}

/** The same leaders as a long-form editorial spread — used on About Us. */
export async function LeadershipSpread() {
  const agents = await getAgents();
  const withBio = agents.filter((a) => a.bio);
  const leaders = withBio.length > 0 ? withBio : agents.slice(0, 1);
  return <LeadershipStack leaders={leaders} />;
}
