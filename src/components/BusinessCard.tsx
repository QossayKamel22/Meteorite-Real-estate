import Image from "next/image";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { isServedImage } from "@/lib/image-url";

export type BusinessCardData = {
  name: string;
  title: string;
  qualifications?: string;
  photo: string;
  phone?: string;
  email: string;
  website: string;
  address: string;
  brokerCard?: string;
  orn: string;
};

/**
 * A team member's business card, drawn in HTML: navy with a gold frame and sweeping gold edges, the
 * skyline mark and name of the company, a round portrait, the person's details, and the licence line.
 * Everything scales with the width of its box, so it fits a phone screen and a desktop dialog alike.
 */
export default function BusinessCard({ c }: { c: BusinessCardData }) {
  const row = "flex items-start gap-[3.2cqw] text-[3.5cqw] leading-snug text-[#f4eddc]";
  const ico = "mt-[0.3cqw] h-[4.6cqw] w-[4.6cqw] flex-none text-[#e2c070]";
  return (
    <div className="relative mx-auto w-full max-w-[22rem] [container-type:inline-size]">
      <div className="relative overflow-hidden rounded-[7cqw] bg-[linear-gradient(165deg,#10163f_0%,#0a0e2c_55%,#070a1f_100%)] p-[2.2cqw] shadow-[0_30px_70px_-28px_rgba(0,0,0,0.8)]" style={{ aspectRatio: "0.64" }}>
        {/* gold frame */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-[1.6cqw] rounded-[6cqw] border border-[#e2c070]/80 shadow-[inset_0_0_14px_rgba(226,192,112,0.25)]" />
        {/* sweeping gold edges */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-[22cqw] -top-[22cqw] h-[56cqw] w-[56cqw] rounded-full border-[0.7cqw] border-[#e2c070]/60 opacity-80" />
        <span aria-hidden="true" className="pointer-events-none absolute -left-[26cqw] -top-[26cqw] h-[56cqw] w-[56cqw] rounded-full border-[0.4cqw] border-[#e2c070]/35" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-[26cqw] -right-[26cqw] h-[62cqw] w-[62cqw] rounded-full border-[0.7cqw] border-[#e2c070]/60 opacity-80" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-[31cqw] -right-[31cqw] h-[62cqw] w-[62cqw] rounded-full border-[0.4cqw] border-[#e2c070]/35" />
        {/* skyline at the foot */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[11cqw] h-[24cqw] opacity-60" style={{ maskImage: "linear-gradient(to top, black 35%, transparent)", WebkitMaskImage: "linear-gradient(to top, black 35%, transparent)" }}>
          <Image src="/brand/hero/dubai-night-skyline.jpg" alt="" fill sizes="400px" className="object-cover object-[50%_60%]" />
        </span>

        <div className="relative flex h-full flex-col items-center px-[7cqw] pb-[3cqw] pt-[6cqw] text-center">
          <Image src="/brand/logo-icon.png" alt="" width={245} height={240} className="h-[12cqw] w-auto" />
          <p className="mt-[1.2cqw] bg-gradient-to-b from-[#f4dc98] via-[#d6b062] to-[#a88038] bg-clip-text text-[6.2cqw] font-semibold leading-none tracking-[0.2em] text-transparent">METEORITE</p>
          <p className="mt-[1.2cqw] flex items-center gap-[1.6cqw] text-[2.3cqw] font-medium tracking-[0.34em] text-[#d6b062]">
            <span aria-hidden="true" className="h-px w-[5cqw] bg-[#d6b062]/70" />REAL ESTATE<span aria-hidden="true" className="h-px w-[5cqw] bg-[#d6b062]/70" />
          </p>
          <p dir="rtl" lang="ar" className="mt-[1.4cqw] text-[3.6cqw] font-medium text-[#d6b062]">ميتيوريت للوساطة العقارية</p>

          <span className="relative mt-[4.5cqw] block h-[22cqw] w-[22cqw] flex-none">
            <span aria-hidden="true" className="absolute -inset-[0.9cqw] rounded-full bg-[conic-gradient(from_20deg,#f4dc98,#a88038,#f4dc98,#c89a48,#f4dc98)]" />
            <span className="absolute inset-0 overflow-hidden rounded-full ring-[0.6cqw] ring-[#0a0e2c]">
              <Image src={c.photo} alt={`Portrait of ${c.name}`} fill sizes="120px" unoptimized={isServedImage(c.photo)} className="object-cover object-top" />
            </span>
          </span>

          <p className="mt-[3.2cqw] bg-gradient-to-b from-[#f4dc98] to-[#c89a48] bg-clip-text text-[6.4cqw] font-semibold leading-tight text-transparent">{c.name}</p>
          <p className="mt-[0.8cqw] text-[3.5cqw] font-medium leading-snug text-[#f4eddc]">{c.title}</p>
          {c.qualifications && <p className="mt-[0.6cqw] text-[2.9cqw] leading-snug text-[#f4eddc]/75">{c.qualifications}</p>}

          <span aria-hidden="true" className="my-[3.2cqw] h-px w-full bg-gradient-to-r from-transparent via-[#e2c070] to-transparent" />

          <ul className="w-full space-y-[1.8cqw] text-left">
            {c.phone && <li className={row}><Phone className={ico} /><span>{c.phone}</span></li>}
            <li className={row}><Mail className={ico} /><span className="break-all">{c.email}</span></li>
            <li className={row}><Globe className={ico} /><span>{c.website}</span></li>
            <li className={row}><MapPin className={ico} /><span className="text-[3cqw]">{c.address}</span></li>
          </ul>

          <p className="relative z-10 mt-auto flex w-full items-center justify-center gap-[3cqw] rounded-full border border-[#e2c070]/70 bg-[#0a0e2c]/80 px-[3cqw] py-[1.6cqw] text-[2.9cqw] font-medium text-[#f4eddc]">
            {c.brokerCard && <><span>Broker Card #{c.brokerCard}</span><span aria-hidden="true" className="h-[3.4cqw] w-px bg-[#e2c070]/70" /></>}
            <span>RERA ORN {c.orn}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
