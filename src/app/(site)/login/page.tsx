import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description: "Sign in to your Meteorite Real Estate account to save favourite properties.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
