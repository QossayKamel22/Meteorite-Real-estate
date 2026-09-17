"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

export default function ImageLightbox({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full text-left"
        aria-label={`Zoom in: ${alt}`}
      >
        {children}
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy/70 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <ZoomIn size={16} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/90 p-4 backdrop-blur-md"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[85vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={1200}
                className="h-auto max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-lg transition-transform hover:scale-105"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
