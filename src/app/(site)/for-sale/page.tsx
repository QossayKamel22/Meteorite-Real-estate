import type { Metadata } from "next";
import PurposeListingPage from "@/components/PurposeListingPage";

export const metadata: Metadata = { title: "For Sale" };

export default function ForSalePage() {
  return <PurposeListingPage purpose="for-sale" />;
}
