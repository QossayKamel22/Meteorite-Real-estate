import type { Metadata } from "next";
import Link from "next/link";
import {
  Ban,
  Cookie,
  Database,
  FileText,
  Fingerprint,
  Mail,
  RefreshCw,
  Scale,
  Server,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { company } from "@/lib/content";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.name} collects, uses, and protects your data.`,
};

const EFFECTIVE_DATE = "September 21, 2026";

const sections = [
  {
    icon: Database,
    title: "What we collect",
    body: [
      "Account details — if you sign in with Google, we receive the name, email address, and profile photo Google shares with us. If you register with email and password, we receive your name and email address; your password itself is handled entirely by Firebase Authentication and is never visible to us in readable form.",
      "Enquiries — the Contact Us form opens your own email app with your message pre-filled and sends it directly to our inbox from your device. We never receive or store anything you type there unless you actually send that email.",
      `Saved properties — if you're browsing as a guest, your favorites are stored only in your browser's local storage and never leave your device. If you're signed in, they're stored against your account so they follow you across devices.`,
      "Basic account activity — for signed-in accounts, we keep a record of when the account was created and when it last signed in, so administrators can manage access.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies",
    body: [
      "We use a single session cookie to keep you signed in between visits. It's marked httpOnly and secure, so it can't be read by page scripts and is only ever sent over an encrypted connection. We don't use advertising or cross-site tracking cookies.",
    ],
  },
  {
    icon: Server,
    title: "Who else processes your data",
    body: [
      "Firebase (Google) provides authentication and the database that powers this site. Your account and saved-property data are stored on Google Cloud infrastructure under Firebase's own data protection terms.",
      "Cloudflare hosts and serves this website.",
      "Stripe processes payments made through the Payment page. We never see or store your card details — Stripe handles that directly and is PCI-DSS certified.",
      "We do not sell your data to anyone, and we don't share it with third parties for their own marketing purposes.",
    ],
  },
  {
    icon: Fingerprint,
    title: "How we use it",
    body: [
      "To operate your account and keep you signed in.",
      "To let you save and revisit properties you're interested in.",
      "To respond to enquiries you send us directly.",
      "To secure the admin dashboard — only accounts an existing administrator has explicitly promoted can access admin features, and every admin action is tied to that account.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "How we protect it",
    body: [
      "Every page is served over HTTPS. Admin access is role-gated at both the routing layer and again on the server for every admin page, so it never depends on a single check. Firestore security rules restrict who can read or write each piece of data, independent of the application code.",
    ],
  },
  {
    icon: UserCog,
    title: "Your choices",
    body: [
      "You can sign out at any time from the account menu, which ends your session immediately.",
      "You can ask us to delete your account and the data tied to it — contact us using the details below and we'll action it.",
      "Browsing as a guest means we hold no account data on you at all; your favorites stay on your own device.",
    ],
  },
  {
    icon: Ban,
    title: "Children",
    body: [
      `${company.name} is a property brokerage service intended for adults. We don't knowingly collect data from anyone under 18.`,
    ],
  },
  {
    icon: RefreshCw,
    title: "Changes to this policy",
    body: [
      "If we materially change what we collect or how we use it, we'll update this page and change the effective date below.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
              <Scale size={26} strokeWidth={1.75} />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Privacy Policy
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Your data, plainly explained
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              No legal jargon for its own sake — here&apos;s exactly what {company.name} collects,
              why, and how it&apos;s protected.
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/40">
              Effective {EFFECTIVE_DATE}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 0.05}>
              <div className="glass shimmer-border rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <section.icon size={18} strokeWidth={1.75} />
                  </span>
                  <h2 className="text-lg font-semibold text-heading">{section.title}</h2>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {section.body.map((paragraph) => (
                    <li key={paragraph} className="flex gap-2.5 text-sm leading-relaxed text-brand-ink/70">
                      <span className="mt-2 h-1 w-1 flex-none rounded-full bg-brand-gold" aria-hidden="true" />
                      {paragraph}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={sections.length * 0.05}>
          <div className="mt-8 rounded-2xl border border-brand-line bg-brand-paper p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <Mail size={18} strokeWidth={1.75} />
              </span>
              <h2 className="text-lg font-semibold text-heading">Questions or requests</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-ink/70">
              For anything about this policy, or to request access to or deletion of your data,
              contact us at{" "}
              <a href={`mailto:${company.email}`} className="font-semibold text-heading hover:text-brand-gold">
                {company.email}
              </a>{" "}
              or{" "}
              <a href={`tel:${company.phoneE164}`} className="font-semibold text-heading hover:text-brand-gold">
                {company.phoneDisplay}
              </a>
              , or use our{" "}
              <Link href="/contact-us" className="font-semibold text-heading hover:text-brand-gold">
                Contact Us
              </Link>{" "}
              page.
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-brand-ink/45">
              <FileText size={13} />
              {company.name} · RERA ORN {company.orn} · Broker Card #{company.brokerCard}
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
