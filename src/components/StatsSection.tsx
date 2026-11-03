import { getStatsList } from "@/lib/site-stats";
import StatsShowcase from "@/components/StatsShowcase";

export default async function StatsSection() {
  const stats = await getStatsList();
  return <StatsShowcase stats={stats.map((s) => ({ label: s.label, value: s.value }))} />;
}
