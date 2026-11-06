import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { getMessages } from "@/lib/messages-data";
import AdminMessagesPanel from "@/components/AdminMessagesPanel";

export const metadata: Metadata = { title: "Messages · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <Inbox size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Messages</h1>
          <p className="text-sm text-brand-ink/66">Enquiries sent from the Contact page and from property pages.</p>
        </div>
      </div>
      <div className="mt-6">
        <AdminMessagesPanel messages={messages} />
      </div>
    </div>
  );
}
