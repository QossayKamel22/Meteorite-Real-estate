"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { company } from "@/lib/content";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOPICS = ["Buy", "Rent", "Sell", "List my property", "Something else"];
const MAX = 800;

const field =
  "peer w-full rounded-xl border border-brand-line bg-surface px-4 pb-2.5 pt-6 text-[15px] outline-none transition-[border-color,box-shadow] duration-300 placeholder-transparent focus:border-brand-gold focus:shadow-[0_0_0_4px_rgba(219,204,59,0.14)]";
const floating =
  "pointer-events-none absolute left-4 top-4 origin-left text-[15px] text-brand-ink/62 transition-all duration-300 peer-focus:-translate-y-2.5 peer-focus:scale-[0.78] peer-focus:text-gold-ink peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.78]";

/**
 * The contact form: floating labels, topic chips that tag the enquiry, a counter ring
 * for the message and a paper plane that takes off when you send. It still opens your
 * email app addressed to the office — nothing is stored by the site.
 */
export default function ContactForm() {
  const reduce = useReducedMotion() ?? false;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState<string>("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "flying" | "sent">("idle");

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
    setState("flying");
    const tag = topic ? ` [${topic}]` : "";
    const subject = encodeURIComponent(`Enquiry${tag} from ${name} via meteoriterealestate.com`);
    const body = encodeURIComponent(`${message}\n\n${topic ? `Interested in: ${topic}\n` : ""}From: ${name} (${email})`);
    window.setTimeout(() => {
      window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;
      setState("sent");
      window.setTimeout(() => setState("idle"), 5000);
    }, reduce ? 0 : 900);
  }

  const used = Math.min(1, message.length / MAX);
  const C = 2 * Math.PI * 9;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/65">I&apos;m interested in</p>
        <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="Topic">
          {TOPICS.map((t) => {
            const on = topic === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTopic(on ? "" : t)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${on ? "text-brand-navy ring-brand-gold" : "text-brand-ink/70 ring-brand-line hover:text-heading hover:ring-brand-gold/50"}`}
              >
                {on && <motion.span layoutId="topic-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} className="absolute inset-0 -z-0 rounded-full bg-brand-gold" />}
                <span className="relative">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder=" " autoComplete="name" className={field} />
        <label htmlFor="name" className={floating}>Full name</label>
      </div>
      <div className="relative">
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder=" " autoComplete="email" className={field} />
        <label htmlFor="email" className={floating}>Email address</label>
      </div>
      <div className="relative">
        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value.slice(0, MAX))} rows={5} required placeholder=" " className={`${field} resize-none`} />
        <label htmlFor="message" className={floating}>Your message</label>
        <svg viewBox="0 0 24 24" className="absolute bottom-3 right-3 h-6 w-6 -rotate-90" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" className="stroke-brand-line" />
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - used)} className={`transition-[stroke-dashoffset,stroke] duration-300 ${used > 0.9 ? "stroke-red-500" : "stroke-brand-gold"}`} />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="text-sm font-medium text-red-600">
            {error}
          </motion.p>
        )}
        {state === "sent" && !error && (
          <motion.p key="sent" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 size={16} /> Your email app is open — press send there to reach us.
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={state === "flying"}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:shadow-[0_18px_40px_-16px_rgba(13,16,49,0.8)] disabled:cursor-wait sm:w-auto dark:bg-brand-gold dark:text-brand-navy"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[130%] group-hover:opacity-100" />
        <span className="relative">{state === "flying" ? "Sending…" : "Send via email"}</span>
        <motion.span
          className="relative"
          animate={state === "flying" && !reduce ? { x: 90, y: -34, rotate: -18, opacity: 0, scale: 0.7 } : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: state === "flying" ? 0.85 : 0.4, ease: EASE }}
        >
          <Send size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </motion.span>
      </button>
      <p className="text-xs text-brand-ink/62">
        Opens your email app addressed to {company.email}. For an instant reply, use WhatsApp or call us directly.
      </p>
    </form>
  );
}
