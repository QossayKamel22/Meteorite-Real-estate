import "server-only";
import { getCfContext } from "@/lib/cf-runtime";

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);

/**
 * Tells the team about a new enquiry, so nobody has to keep the admin open. Each channel switches on by
 * itself when its secrets exist (see README → Notifications); with none set this does nothing.
 *  - Telegram: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 *  - Email (Resend): RESEND_API_KEY + NOTIFY_EMAIL (+ optional NOTIFY_FROM)
 * It never throws and never delays the visitor: it runs after the response is sent.
 */
/** Which channels have their secrets set (never the secrets themselves). */
export function notifyChannels(): { telegram: boolean; email: boolean } {
  return { telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID), email: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) };
}

export function notifyNewMessage(m: { name: string; email: string; phone: string; topic: string; message: string; source: string; viewing?: string }): void {
  const tasks: Promise<unknown>[] = [];
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    const text = `📩 New enquiry — Meteorite Real Estate\n\n${m.name}${m.topic ? ` · ${m.topic}` : ""}\n${m.email}${m.phone ? `\n${m.phone}` : ""}${m.viewing ? `\n🗓 Viewing: ${m.viewing}` : ""}${m.source ? `\nFrom: https://meteoriterealestate.com${m.source}` : ""}\n\n${m.message}\n\nOpen the inbox: https://meteoriterealestate.com/admin/messages`;
    tasks.push(
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(6000),
      })
    );
  }
  const resend = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (resend && to) {
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.NOTIFY_FROM || "Meteorite Website <onboarding@resend.dev>",
          to: to.split(",").map((x) => x.trim()),
          reply_to: m.email,
          subject: `New enquiry from ${m.name}${m.topic ? ` (${m.topic})` : ""}`,
          html: `<p><b>${esc(m.name)}</b> — <a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? ` — ${esc(m.phone)}` : ""}</p><p>${esc(m.topic)}${m.viewing ? ` — viewing ${esc(m.viewing)}` : ""}</p><p style="white-space:pre-wrap">${esc(m.message)}</p><p><a href="https://meteoriterealestate.com/admin/messages">Open the inbox</a></p>`,
        }),
        signal: AbortSignal.timeout(6000),
      })
    );
  }
  if (tasks.length === 0) return;
  const all = Promise.allSettled(tasks).then((r) => {
    for (const x of r) if (x.status === "rejected") console.error("notify failed", x.reason);
  });
  const cf = getCfContext();
  if (cf) cf.ctx.waitUntil(all);
}
