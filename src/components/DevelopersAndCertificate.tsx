import Image from "next/image";
import { Award, CalendarCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { certificate, developerPartners } from "@/lib/content";
import Reveal from "@/components/Reveal";
import ImageLightbox from "@/components/ImageLightbox";
import LogoMarquee from "@/components/LogoMarquee";

export default function DevelopersAndCertificate() {
  return (
    <section className="bg-brand-paper py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Trusted Partnerships
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              Registered with the following developers
            </h2>
            <span className="mx-auto mt-4 block h-0.5 w-16 rounded-full bg-brand-gold" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="shimmer-border relative mt-10 overflow-hidden rounded-3xl border border-brand-line bg-white py-10">
            <LogoMarquee />
            <p className="mt-2 text-center text-xs text-brand-ink/40">
              {developerPartners.length} registered developer partnerships across Dubai
            </p>
          </div>
        </Reveal>

        <div className="mt-20 text-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Official Registration
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              Our certificate
            </h2>
            <span className="mx-auto mt-4 block h-0.5 w-16 rounded-full bg-brand-gold" />
          </Reveal>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal delay={0.1}>
            <ImageLightbox src={certificate.image} alt="Meteorite Real Estate — Dubai Land Department RERA registration certificate">
              <div className="glass shimmer-border overflow-hidden rounded-3xl bg-white p-3">
                <Image
                  src={certificate.image}
                  alt="Real Estate Office Registration Certificate — Dubai Land Department, RERA"
                  width={1289}
                  height={907}
                  className="w-full rounded-2xl"
                />
              </div>
            </ImageLightbox>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="space-y-4">
              <div className="glass shimmer-border flex items-start gap-3 rounded-2xl p-5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <FileCheck2 size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
                    Trade Name
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">
                    {certificate.tradeName}
                  </p>
                </div>
              </div>

              <div className="glass shimmer-border flex items-start gap-3 rounded-2xl p-5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <ShieldCheck size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
                    License No.
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">
                    {certificate.licenseNo} · {certificate.classification}
                  </p>
                </div>
              </div>

              <div className="glass shimmer-border flex items-start gap-3 rounded-2xl p-5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <CalendarCheck size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
                    Registered · Expires
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">
                    {certificate.registrationDate} — {certificate.expiryDate}
                  </p>
                </div>
              </div>

              <div className="glass shimmer-border flex items-start gap-3 rounded-2xl p-5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <Award size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
                    Activities
                  </p>
                  <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">
                    {certificate.activities.join(" · ")}
                  </p>
                </div>
              </div>

              <p className="pt-1 text-xs text-brand-ink/45">
                Issued by {certificate.issuer}. Click the certificate to view full size.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
