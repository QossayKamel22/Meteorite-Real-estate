import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getCertificates } from "@/lib/certificates-data";
import AdminCertificatesPanel from "@/components/AdminCertificatesPanel";

export const metadata: Metadata = { title: "Certificates · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  const certificates = await getCertificates();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <ShieldCheck size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Certificates</h1>
          <p className="text-sm text-brand-ink/55">
            Shown in the About Us &quot;Our Certificate&quot; section.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminCertificatesPanel certificates={certificates} />
      </div>
    </div>
  );
}
