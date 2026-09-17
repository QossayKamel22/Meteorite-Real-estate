"use client";

import { useState } from "react";
import { company } from "@/lib/content";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-ink/70">
          Full name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          required
          className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-ink/70">
          Email address
        </label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-brand-ink/70">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          className="mt-1.5 w-full rounded-xl border border-brand-line px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-brand-navy px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light sm:w-auto"
      >
        Send via email
      </button>
      <p className="text-xs text-brand-ink/45">
        Opens your email app addressed to {company.email}. For an instant reply, use WhatsApp or
        call us directly.
      </p>
    </form>
  );
}
