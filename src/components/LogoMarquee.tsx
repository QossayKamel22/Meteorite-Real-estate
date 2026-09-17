import Image from "next/image";
import { developerPartners } from "@/lib/content";

export default function LogoMarquee() {
  const track = [...developerPartners, ...developerPartners];

  return (
    <div
      className="relative overflow-hidden py-4"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max items-center gap-6">
        {track.map((dev, i) => (
          <div
            key={`${dev.name}-${i}`}
            className="shimmer-border group relative flex h-24 w-44 flex-none items-center justify-center overflow-hidden rounded-2xl border border-brand-gold/15 bg-gradient-to-b from-white to-brand-paper p-6 shadow-[0_2px_10px_-4px_rgba(13,16,49,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_16px_32px_-12px_rgba(219,204,59,0.35)]"
          >
            <Image
              src={dev.logo}
              alt={dev.name}
              width={140}
              height={64}
              className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
            />
            <span className="absolute inset-0 flex translate-y-2 items-center justify-center bg-gradient-to-b from-white to-brand-paper px-3 text-center text-xs font-semibold text-heading opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {dev.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
