import type { Metadata } from "next";
import PurposeListingPage from "@/components/PurposeListingPage";

export const metadata: Metadata = { title: "For Rent" };

export default function ForRentPage() {
  return <PurposeListingPage purpose="for-rent" />;
}
