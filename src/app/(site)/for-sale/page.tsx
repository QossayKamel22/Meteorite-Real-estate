import type { Metadata } from "next";
import PurposeListingPage from "@/components/PurposeListingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Properties for Sale in Dubai",
  description:
    "Browse apartments, villas and townhouses for sale across Dubai and the UAE, listed by RERA-certified brokers Meteorite Real Estate.",
  path: "/for-sale",
});

export default function ForSalePage() {
  return <PurposeListingPage purpose="for-sale" />;
}
