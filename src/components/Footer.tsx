import Image from "next/image";
import Link from "next/link";
import { company, socialLinks } from "@/lib/content";
import { getSocialAccounts } from "@/lib/social-accounts";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "For Sale", href: "/for-sale" },
  { label: "For Rent", href: "/for-rent" },
  { label: "Contact", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default async function Footer() {
  const accounts = await getSocialAccounts();
  return (
    <footer className="border-t border-white/10 bg-brand-navy text-white/85">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1.5fr] lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Image
              src="/brand/logo-transparent.png"
              alt={`${company.name} logo`}
              width={149}
              height={27}
              className="h-7 w-auto brightness-125"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {company.legalTagline}
            </p>
            <div className="mt-5 flex gap-4">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-brand-gold"
                aria-label="Meteorite Real Estate on Facebook"
              >
                Facebook
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-brand-gold"
                aria-label="Meteorite Real Estate on Twitter"
              >
                Twitter
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-brand-gold"
                aria-label="Meteorite Real Estate on Instagram"
              >
                Instagram
              </a>
              {accounts.tiktok && (
                <a
                  href={accounts.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 transition-colors hover:text-brand-gold"
                  aria-label="Meteorite Real Estate on TikTok"
                >
                  TikTok
                </a>
              )}
              {accounts.youtube && (
                <a
                  href={accounts.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 transition-colors hover:text-brand-gold"
                  aria-label="Meteorite Real Estate on YouTube"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link prefetch={false}
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-brand-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">Contact</h3>
            <ul className="mt-4 space-y-2.5 break-words text-sm text-white/60">
              <li>{company.address}</li>
              <li>P.O. Box: {company.poBox}</li>
              <li>
                <a href={`tel:${company.phoneE164}`} className="hover:text-brand-gold">
                  {company.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="hover:text-brand-gold">
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={company.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-gold"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>{company.copyrightNotice}</p>
            <p>
              Website designed &amp; developed by <span className="font-medium text-white/70">Qossay Kamel</span> for {company.name}.
            </p>
          </div>
          <p>
            RERA ORN {company.orn} · Broker Card #{company.brokerCard}
          </p>
        </div>
      </div>
    </footer>
  );
}
