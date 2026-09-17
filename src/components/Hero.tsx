import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      <Image
        src="/brand/hero-dubai-skyline.jpg"
        alt="Dubai skyline at dusk"
        fill
        priority
        className="object-cover opacity-40"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/30" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
          Dubai Real Estate, Since 2005
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          The best way to find your dream home.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
          We help you get the best deal — a RERA-certified brokerage guiding you through buying,
          selling, leasing and property management across the UAE.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/for-sale"
            className="rounded-full bg-brand-gold px-7 py-3.5 text-center text-[15px] font-semibold text-brand-navy transition-transform hover:scale-[1.02]"
          >
            Browse properties for sale
          </Link>
          <Link
            href="/for-rent"
            className="rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-center text-[15px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            Browse properties for rent
          </Link>
        </div>
      </div>
    </section>
  );
}
