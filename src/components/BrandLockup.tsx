import Image from "next/image";

/**
 * The brand as one horizontal line for the header: the skyline mark, then METEORITE over REAL ESTATE in
 * the logo's gold. It is live text (sharp at every size, nothing to download beyond the small mark), and the
 * gold is a mid-tone that holds on navy, on photographs and on white.
 */
export default function BrandLockup({ size = "md", priority = false }: { size?: "md" | "sm"; priority?: boolean }) {
  const sm = size === "sm";
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/brand/logo-icon.png" alt="" width={245} height={240} priority={priority} className={`w-auto ${sm ? "h-8" : "h-9 sm:h-10"}`} />
      <span className="flex flex-col leading-none">
        <span className={`bg-gradient-to-b from-[#f0d98f] via-[#d2ac5c] to-[#a07c38] bg-clip-text font-semibold text-transparent ${sm ? "text-[15px] tracking-[0.2em]" : "text-[17px] tracking-[0.22em] sm:text-lg"}`}>METEORITE</span>
        <span className={`mt-1 flex items-center gap-1.5 font-medium text-[#c9a458] ${sm ? "text-[7px] tracking-[0.34em]" : "text-[8px] tracking-[0.38em] sm:text-[9px]"}`}>
          <span aria-hidden="true" className="h-px w-3 bg-[#c9a458]/70" />
          REAL ESTATE
          <span aria-hidden="true" className="h-px w-3 bg-[#c9a458]/70" />
        </span>
      </span>
    </span>
  );
}
