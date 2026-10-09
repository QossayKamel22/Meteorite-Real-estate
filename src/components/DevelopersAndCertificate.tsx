import Image from "next/image";
import { isServedImage } from "@/lib/image-url";
import { Award, CalendarCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { developerPartners } from "@/lib/content";
import { getCertificates } from "@/lib/certificates-data";
import Reveal from "@/components/Reveal";
import ImageLightbox from "@/components/ImageLightbox";
import LogoMarquee from "@/components/LogoMarquee";
import SectionHeading from "@/components/SectionHeading";

export default async function DevelopersAndCertificate() {
  const certificates = await getCertificates();

  return (
    <section className="bg-brand-paper py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <SectionHeading kicker="Trusted Partnerships" title="Registered with the following developers" align="center" />
        </div>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-brand-ink/60">
            Our registrations span Dubai&apos;s leading master developers — hover any mark for
            its name, or view our full certificate below.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-brand-gold/20 bg-gradient-to-b from-white to-brand-paper py-10 shadow-[0_20px_60px_-30px_rgba(219,204,59,0.5)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-28px_rgba(219,204,59,0.65)]">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
            <LogoMarquee />
            <p className="relative mt-4 text-center text-xs text-brand-ink/40">
              {developerPartners.length} registered developer partnerships across Dubai
            </p>
          </div>
        </Reveal>

        {certificates.map((certificate, i) => (
          <div key={certificate.id}>
            {i === 0 && (
              <div className="mt-20 text-center">
                <SectionHeading
                  kicker="Official Registration"
                  title={`Our certificate${certificates.length > 1 ? "s" : ""}`}
                  align="center"
                />
              </div>
            )}

            <div className={`grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center ${i === 0 ? "mt-10" : "mt-16"}`}>
              <Reveal delay={0.1}>
                <ImageLightbox src={certificate.image} alt={certificate.title}>
                  <div className="glass shimmer-border group overflow-hidden rounded-3xl bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="overflow-hidden rounded-2xl">
                      <Image
                        src={certificate.image}
                        unoptimized={isServedImage(certificate.image)}
                        alt={certificate.title}
                        width={1289}
                        height={907}
                        className="w-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </ImageLightbox>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="space-y-4">
                  <div className="glass shimmer-border flex items-start gap-3 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
                      <FileCheck2 size={18} strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
                        Title
                      </p>
                      <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">
                        {certificate.title}
                      </p>
                    </div>
                  </div>

                  {certificate.licenseNo && (
                    <div className="glass shimmer-border flex items-start gap-3 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
                        <ShieldCheck size={18} strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
                          License No.
                        </p>
                        <p className="mt-0.5 text-[15px] font-medium text-brand-ink/85">
                          {certificate.licenseNo}
                        </p>
                      </div>
                    </div>
                  )}

                  {(certificate.registrationDate || certificate.expiryDate) && (
                    <div className="glass shimmer-border flex items-start gap-3 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
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
                  )}

                  {certificate.activities && certificate.activities.length > 0 && (
                    <div className="glass shimmer-border flex items-start gap-3 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
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
                  )}

                  {certificate.issuer && (
                    <p className="pt-1 text-xs text-brand-ink/45">
                      Issued by {certificate.issuer}. Click the certificate to view full size.
                    </p>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
