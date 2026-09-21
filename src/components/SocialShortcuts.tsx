"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { company, socialLinks } from "@/lib/content";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, XIcon } from "@/components/SocialIcons";
import Reveal from "@/components/Reveal";

const PLATFORMS = [
  {
    name: "Instagram",
    handle: "@meteorite.real.estate.dubai",
    href: socialLinks.instagram,
    Icon: InstagramIcon,
    glow: "from-[#FF543E]/25 via-[#C837AB]/20 to-transparent",
  },
  {
    name: "Facebook",
    handle: "Follow our page",
    href: socialLinks.facebook,
    Icon: FacebookIcon,
    glow: "from-[#1877F2]/25 via-[#1877F2]/10 to-transparent",
  },
  {
    name: "X",
    handle: "Follow @MeteoriteRE",
    href: socialLinks.twitter,
    Icon: XIcon,
    glow: "from-white/15 via-white/5 to-transparent",
  },
  {
    name: "WhatsApp",
    handle: company.phoneDisplay,
    href: company.whatsappUrl,
    Icon: WhatsAppIcon,
    glow: "from-[#25D366]/25 via-[#25D366]/10 to-transparent",
  },
] as const;

export default function SocialShortcuts() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {PLATFORMS.map((platform, i) => (
        <Reveal key={platform.name} delay={i * 0.08}>
          <motion.a
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Meteorite Real Estate on ${platform.name}`}
            className="glass glass-dark shimmer-border group relative flex h-full flex-col items-center overflow-hidden rounded-2xl px-4 py-7 text-center"
            whileHover={reduceMotion ? undefined : { y: -6 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${platform.glow}`}
            />
            <motion.div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"
              whileHover={reduceMotion ? undefined : { rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <platform.Icon size={28} />
            </motion.div>
            <p className="relative mt-4 text-sm font-semibold text-white">{platform.name}</p>
            <p className="relative mt-1 truncate text-xs text-white/55">{platform.handle}</p>
            <span className="relative mt-3 flex items-center gap-1 text-[11px] font-medium text-brand-gold opacity-0 transition-all duration-300 group-hover:opacity-100">
              Visit <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </motion.a>
        </Reveal>
      ))}
    </div>
  );
}
