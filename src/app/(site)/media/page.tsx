import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Camera, Home, PlayCircle, Store, Warehouse } from "lucide-react";
import { company, externalListings, socialLinks } from "@/lib/content";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Media" };

const categories = [
  { label: "Apartments & Studios", icon: Building2, href: externalListings.bayutForSale + "&category=apartment" },
  { label: "Villas", icon: Home, href: externalListings.bayutForSale + "&category=villa" },
  { label: "Townhouses", icon: Warehouse, href: externalListings.bayutForSale + "&category=townhouse" },
  { label: "Commercial", icon: Store, href: externalListings.bayutForSale + "&category=commercial" },
];

export default function MediaPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
              <PlayCircle size={26} strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Media
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Property video tours
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              Each listing has its own walkthrough video, hosted alongside its full details on
              our verified Bayut portfolio — browse by category to find one.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.07}>
              <a
                href={cat.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass shimmer-border group flex h-full flex-col justify-between rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <cat.icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-heading">{cat.label}</h3>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-ink/60 group-hover:text-brand-gold">
                  Watch tours <span aria-hidden="true">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-brand-line bg-brand-paper p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <Camera size={20} strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-semibold text-heading">More video content on Instagram</p>
                <p className="text-sm text-brand-ink/60">@meteorite.real.estate.dubai</p>
              </div>
            </div>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-brand-navy-light"
            >
              Follow us
            </a>
          </div>
        </Reveal>

        <p className="mt-6 text-center text-xs text-brand-ink/45">
          Looking for something specific?{" "}
          <Link href="/contact-us" className="font-medium text-heading hover:text-brand-gold">
            Contact us
          </Link>{" "}
          and we&apos;ll send you a private tour, or{" "}
          <a
            href={`https://wa.me/${company.phoneE164.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-heading hover:text-brand-gold"
          >
            WhatsApp our team
          </a>
          .
        </p>
      </section>
    </div>
  );
}
