import type { Metadata } from "next";
import { company } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Add Property" };

export default function CreatePropertyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <SectionHeading kicker="List With Us" title="Add your property" as="h1" align="center" />
      <Reveal delay={0.2}>
      <p className="mt-5 text-lg leading-relaxed text-brand-ink/70">
        Listing submissions are handled by our agents to ensure every property is verified
        before it goes live. Reach out and our team will list it for you.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={company.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-brand-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          WhatsApp our team
        </a>
        <a
          href={`mailto:${company.email}`}
          className="rounded-full border border-brand-line px-7 py-3.5 text-[15px] font-semibold text-heading transition-colors hover:bg-brand-paper"
        >
          Email {company.email}
        </a>
      </div>
      </Reveal>
    </div>
  );
}
