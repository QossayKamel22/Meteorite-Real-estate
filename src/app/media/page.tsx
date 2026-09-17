import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Media" };

export default function MediaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Media</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-brand-navy sm:text-5xl">
        Property video tours
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-brand-ink/70">
        Our video walkthroughs currently live on our original website. We&apos;re migrating this
        library into the new experience — in the meantime, view them here.
      </p>
      <a
        href="https://meteoriterealestate.com/media-2/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex rounded-full bg-brand-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
      >
        View property videos
      </a>
      <p className="mt-6 text-sm">
        <Link href="/contact-us" className="font-medium text-brand-navy hover:text-brand-gold">
          Or contact us for a private tour →
        </Link>
      </p>
    </div>
  );
}
