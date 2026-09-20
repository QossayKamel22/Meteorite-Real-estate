"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { company, navLinks } from "@/lib/content";
import ThemeToggle from "@/components/ThemeToggle";
import UserAvatarMenu from "@/components/UserAvatarMenu";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass-nav sticky top-0 z-50 border-b transition-[border-color,box-shadow] duration-300 ${
        scrolled ? "border-brand-line/70 shadow-[0_1px_0_rgba(13,16,49,0.04)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label={`${company.name} home`}>
          <Image
            src="/brand/logo-transparent.png"
            alt={`${company.name} logo`}
            width={149}
            height={27}
            priority
            className="h-7 w-auto transition-transform duration-300 hover:scale-105 sm:h-8"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-[15px] font-medium text-brand-ink/80 transition-colors hover:text-heading"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/favorites"
            aria-label="Saved properties"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-paper hover:text-heading"
          >
            <Heart size={18} />
          </Link>
          <ThemeToggle />
          <UserAvatarMenu variant="desktop" />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-heading"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="glass-nav border-t border-brand-line/70 lg:hidden">
          <nav className="flex flex-col px-4 py-3" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-3 text-base font-medium text-brand-ink/85 hover:bg-brand-paper"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/favorites"
              className="flex items-center gap-2 rounded-lg px-2 py-3 text-base font-medium text-brand-ink/85 hover:bg-brand-paper"
              onClick={() => setOpen(false)}
            >
              <Heart size={17} /> Saved Properties
            </Link>
            <UserAvatarMenu variant="mobile" />
          </nav>
        </div>
      )}
    </header>
  );
}
