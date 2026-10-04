import type { Metadata } from "next";
import PurposeListingPage from "@/components/PurposeListingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Properties for Rent in Dubai",
  description:
    "Find apartments, villas and commercial spaces for rent in Dubai and across the UAE with RERA-certified brokers Meteorite Real Estate.",
  path: "/for-rent",
});

export default function ForRentPage() {
  return <PurposeListingPage purpose="for-rent" />;
}
