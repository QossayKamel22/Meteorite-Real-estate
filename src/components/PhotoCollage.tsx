import { company } from "@/lib/content";
import { getAgents } from "@/lib/agents-data";
import PhotoCollageView from "@/components/PhotoCollageView";

export default async function PhotoCollage() {
  const agents = await getAgents();
  return <PhotoCollageView companyName={company.name} people={agents.map((a) => ({ id: a.id, name: a.name, title: a.title, photo: a.photo }))} />;
}
