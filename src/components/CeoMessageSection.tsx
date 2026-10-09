import { getCeoMessage } from "@/lib/ceo-message";
import CeoMessageCard from "@/components/CeoMessageCard";

export default async function CeoMessageSection() {
  const { text, signerTitle, company } = await getCeoMessage();
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand-podcast py-20 sm:py-24">
      <div className="glow-field-podcast" />
      <div className="grain-overlay" />

      {/* Skyline silhouette, drifting very slowly */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        className="skyline-drift pointer-events-none absolute -inset-x-[3%] bottom-0 z-0 h-28 w-[106%] text-brand-podcast-accent opacity-[0.07] sm:h-36"
        fill="currentColor"
      >
        <path d="M0 160V110h50V70h40v40h30V40h50v70h40V85h30v25h50V55h45v55h35V90h40v20h55V30h50v80h40V75h35v35h50V60h45v50h40V95h30v15h55V45h50v65h40V80h40v30h50V65h45v45h40V100h50v60z" />
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <CeoMessageCard paragraphs={paragraphs} signerTitle={signerTitle} company={company} />
      </div>
    </section>
  );
}
