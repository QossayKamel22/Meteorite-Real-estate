"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mail, MessageSquare, Send, User } from "lucide-react";
import { company } from "@/lib/content";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please enter your name and a message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    const subject = encodeURIComponent(`Enquiry from ${name} via meteoriterealestate.com`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
    setSent(true);
    window.setTimeout(() => setSent(false), 4000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-ink/70">
          Full name
        </label>
        <div className="relative mt-1.5">
          <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/35" />
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            required
            className="w-full rounded-xl border border-brand-line bg-surface py-3 pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-brand-gold"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-ink/70">
          Email address
        </label>
        <div className="relative mt-1.5">
          <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/35" />
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded-xl border border-brand-line bg-surface py-3 pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-brand-gold"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-ink/70">
          Message
        </label>
        <div className="relative mt-1.5">
          <MessageSquare size={16} className="pointer-events-none absolute left-4 top-3.5 text-brand-ink/35" />
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            className="w-full rounded-xl border border-brand-line bg-surface py-3 pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-brand-gold"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="text-sm font-medium text-red-600"
          >
            {error}
          </motion.p>
        )}
        {sent && !error && (
          <motion.p
            key="sent"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="flex items-center gap-2 text-sm font-medium text-emerald-600"
          >
            <CheckCircle2 size={16} /> Opening your email app now…
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-brand-navy-light sm:w-auto"
      >
        Send via email
        <Send size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
      <p className="text-xs text-brand-ink/45">
        Opens your email app addressed to {company.email}. For an instant reply, use WhatsApp or
        call us directly.
      </p>
    </form>
  );
}
