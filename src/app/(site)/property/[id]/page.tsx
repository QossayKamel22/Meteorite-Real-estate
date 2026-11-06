import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Bath, BedDouble, Check, MapPin, MessageCircle, Phone, Ruler } from "lucide-react";
import { company } from "@/lib/content";
import { getProperties, getProperty } from "@/lib/properties-data";
import { isServedImage, SAFE_DOC_ID } from "@/lib/image-url";
import { pageMetadata } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";
import PropertyGallery from "@/components/PropertyGallery";
import FavoriteButton from "@/components/FavoriteButton";
import PropertyCard from "@/components/PropertyCard";

type Props = { params: Promise<{ id: string }> };

const money = (p: { price: number; purpose: string; rentFrequency?: string }) =>
  `AED ${p.price.toLocaleString("en-US")}${p.purpose === "rent" ? (p.rentFrequency === "monthly" ? " / month" : " / year") : ""}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = SAFE_DOC_ID.test(id) ? await getProperty(id) : null;
  if (!p || p.visible === false) return { title: "Property not found", robots: { index: false } };
  return pageMetadata({
    title: p.title,
    description: `${p.type} ${p.purpose === "rent" ? "for rent" : "for sale"} in ${p.location} — ${money(p)}. ${p.isStudio ? "Studio" : `${p.bedrooms} bed`}, ${p.bathrooms} bath, ${p.sizeSqft.toLocaleString("en-US")} sqft. Listed by ${company.name}.`,
    path: `/property/${id}`,
  });
}

/**
 * One listing in full. It is an ordinary server-rendered page (cached after its first visit, like every
 * other page), with no client code except the enquiry form, so it adds nothing to the weight of the rest of the site.
 */
export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  if (!SAFE_DOC_ID.test(id)) notFound();
  const p = await getProperty(id);
  if (!p || p.visible === false) notFound();

  const all = await getProperties({ purpose: p.purpose });
  const related = all.filter((x) => x.id !== p.id).slice(0, 3);
  const image = isServedImage(p.image) || p.image.startsWith("/") || p.image.startsWith("http") ? p.image : `/api/img/property/${p.id}`;
  const back = p.purpose === "rent" ? "/for-rent" : "/for-sale";
  const wa = `https://wa.me/${company.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi, I'm interested in: ${p.title} (${p.location}).`)}`;
  const specs = [
    { Icon: BedDouble, label: "Bedrooms", value: p.isStudio ? "Studio" : String(p.bedrooms) },
    { Icon: Bath, label: "Bathrooms", value: String(p.bathrooms) },
    { Icon: Ruler, label: "Size", value: `${p.sizeSqft.toLocaleString("en-US")} sqft` },
  ];

  return (
    <div>
      <section className="relative isolate -mt-16 overflow-hidden bg-brand-navy pt-28 sm:pt-32">
        <Image src={image} alt="" fill priority sizes="100vw" unoptimized={isServedImage(image)} className="-z-20 object-cover opacity-40 blur-2xl" aria-hidden="true" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(8,10,34,0.75),rgba(13,16,49,0.95))]" />
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <Link prefetch={false} href={back} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-brand-gold">
            <ArrowLeft size={15} /> Back to {p.purpose === "rent" ? "rentals" : "properties for sale"}
          </Link>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <PropertyGallery images={[image, ...(p.gallery ?? [])]} title={p.title} badge={p.type} badge2={p.purpose === "rent" ? "For rent" : "For sale"} />
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold"><MapPin size={13} /> {p.location}</p>
              <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">{p.title}</h1>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-gold-soft">{money(p)}</p>
              <ul className="mt-5 grid grid-cols-3 gap-2">
                {specs.map(({ Icon, label, value }) => (
                  <li key={label} className="rounded-2xl border border-white/12 bg-white/[0.06] px-3 py-2.5 text-center">
                    <Icon size={16} className="mx-auto text-brand-gold" />
                    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/55">{label}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform hover:scale-[1.03]"><MessageCircle size={16} /> WhatsApp about this</a>
                <a href={`tel:${company.phoneE164}`} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-gold"><Phone size={15} /> Call</a>
                <FavoriteButton id={p.id} label className="rounded-full border border-white/25 px-5 py-2.5 text-white hover:border-brand-gold" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          {p.description && (
            <>
              <h2 className="text-lg font-semibold text-heading">About this property</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-brand-ink/75">
                {p.description.split(/\n\s*\n/).map((t, i) => <p key={i}>{t}</p>)}
              </div>
            </>
          )}
          {p.amenities && p.amenities.length > 0 && (
            <>
              <h2 className="mt-9 text-lg font-semibold text-heading">Features &amp; amenities</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {p.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-sm text-brand-ink/80"><span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-gold/20 text-gold-ink"><Check size={12} strokeWidth={3} /></span>{a}</li>
                ))}
              </ul>
            </>
          )}
          {p.sourceUrl && (
            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-ink hover:underline">View the original listing on Bayut <ArrowUpRight size={14} /></a>
          )}
        </div>
        <aside>
          <div className="glass shimmer-border rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-heading">Enquire about this property</h2>
            <p className="mb-5 mt-1 text-sm text-brand-ink/66">Leave your details and our team will come back to you.</p>
            <ContactForm source={`/property/${p.id}`} presetMessage={`Hi, I'm interested in: ${p.title} (${p.location}).`} />
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-heading">More {p.purpose === "rent" ? "rentals" : "properties for sale"}</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => <PropertyCard key={r.id} property={r} delay={i * 0.06} />)}
          </div>
        </section>
      )}
    </div>
  );
}
