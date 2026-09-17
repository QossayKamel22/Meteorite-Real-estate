import type { Metadata } from "next";
import { company, credentials, ceo } from "@/lib/content";
import CeoSection from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";

export const metadata: Metadata = {
  title: "About Us",
  description: company.legalTagline,
};

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
        About Us
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-brand-navy sm:text-5xl">
        {company.name}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-brand-ink/75">{company.legalTagline}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {credentials.map((item) => (
          <div key={item} className="rounded-2xl border border-brand-line bg-brand-paper p-5 text-sm font-medium text-brand-ink/70">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-brand-line p-6">
        <h2 className="text-lg font-semibold text-brand-navy">Registration Details</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-brand-ink/50">Office Address</dt>
            <dd className="mt-1 text-brand-ink/80">{company.address}</dd>
          </div>
          <div>
            <dt className="text-brand-ink/50">P.O. Box</dt>
            <dd className="mt-1 text-brand-ink/80">{company.poBox}</dd>
          </div>
          <div>
            <dt className="text-brand-ink/50">RERA ORN</dt>
            <dd className="mt-1 text-brand-ink/80">{company.orn}</dd>
          </div>
          <div>
            <dt className="text-brand-ink/50">Broker Card</dt>
            <dd className="mt-1 text-brand-ink/80">#{company.brokerCard}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-4 text-xs text-brand-ink/45">
        {ceo.name} appears in our public records as {ceo.title.toLowerCase()}; see the
        leadership section below for verified details.
      </p>

      <div className="mt-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <CeoSection />
        <AgentsSection />
      </div>
    </div>
  );
}
