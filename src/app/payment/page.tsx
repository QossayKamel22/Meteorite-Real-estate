import type { Metadata } from "next";
import { company } from "@/lib/content";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Payment</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
        Payment options
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-brand-ink/70">
        For rent, sale and service payments, please contact our team directly — we&apos;ll guide
        you through the secure payment method that applies to your transaction.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href={`tel:${company.phoneE164}`}
          className="rounded-full bg-brand-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
        >
          Call {company.phoneDisplay}
        </a>
        <a
          href={company.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-brand-line px-7 py-3.5 text-[15px] font-semibold text-heading transition-colors hover:bg-brand-paper"
        >
          WhatsApp Us
        </a>
      </div>
    </div>
  );
}
