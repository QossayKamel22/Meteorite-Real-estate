import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Create Account",
  description: "Create a Meteorite Real Estate account to save and manage your favourite properties.",
  path: "/register",
  noindex: true,
});

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
