import { getAgents } from "@/lib/agents-data";
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
  return <LeadershipCarousel leaders={leaders} />;
}

/** The same leaders as a long-form editorial spread — used on About Us. */
export async function LeadershipSpread() {
  const agents = await getAgents();
  const withBio = agents.filter((a) => a.bio);
  const leaders = withBio.length > 0 ? withBio : agents.slice(0, 1);
  return <LeadershipStack leaders={leaders} />;
}
