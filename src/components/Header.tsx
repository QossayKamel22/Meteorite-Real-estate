"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { company, navLinks } from "@/lib/content";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line/70 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label={`${company.name} home`}>
          <Image
            src="/brand/logo.png"
            alt={`${company.name} logo`}
            width={149}
            height={27}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-brand-ink/80 transition-colors hover:text-brand-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/favorites"
            className="text-[15px] font-medium text-brand-ink/80 transition-colors hover:text-brand-navy"
          >
            Saved
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand-navy px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-brand-navy-light"
          >
            Sign in
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-2 text-brand-navy lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-brand-line/70 bg-white lg:hidden">
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
              className="rounded-lg px-2 py-3 text-base font-medium text-brand-ink/85 hover:bg-brand-paper"
              onClick={() => setOpen(false)}
            >
              Saved Properties
            </Link>
            <Link
              href="/login"
              className="mt-2 rounded-full bg-brand-navy px-5 py-3 text-center text-base font-medium text-white"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
