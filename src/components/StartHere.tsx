import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Reveal from "@/components/Reveal";
import { company } from "@/lib/content";

const wa = `https://wa.me/${company.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hi, I'd like to talk about property in Dubai.")}`;

/** A quiet call to action: one question, one line of proof, two buttons. */
export default function StartHere() {
  return (
    <section aria-labelledby="start-here" className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
      <Reveal>
        <h2 id="start-here" className="text-3xl font-semibold tracking-tight text-heading sm:text-4xl">Where do you start?</h2>
        <p className="mt-3 text-brand-ink/70">With a RERA-certified Dubai brokerage, trusted since 2005.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-gold px-6 text-sm font-semibold text-brand-navy transition-transform hover:scale-[1.03]">
            <MessageCircle size={16} aria-hidden="true" /> Start on WhatsApp
          </a>
          <Link prefetch={false} href="/for-sale" className="inline-flex min-h-11 items-center rounded-full border border-brand-line px-6 text-sm font-semibold text-heading transition-colors hover:border-brand-gold">
            Browse properties
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
