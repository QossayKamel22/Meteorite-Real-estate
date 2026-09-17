import Image from "next/image";
import { developerPartners } from "@/lib/content";

export default function LogoMarquee() {
  const track = [...developerPartners, ...developerPartners];

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className="marquee-track flex w-max items-center gap-14">
        {track.map((dev, i) => (
          <div
            key={`${dev.name}-${i}`}
            className="flex h-14 w-32 flex-none items-center justify-center opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={dev.logo}
              alt={dev.name}
              width={128}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
