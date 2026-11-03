import { getCertificates } from "@/lib/certificates-data";
import PartnershipsPanel from "@/components/PartnershipsPanel";
import CertificateShowcase from "@/components/CertificateShowcase";

export default async function DevelopersAndCertificate() {
  const certificates = await getCertificates();

  return (
    <section className="bg-brand-paper py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PartnershipsPanel />
        {certificates.map((c, i) => (
          <CertificateShowcase
            key={c.id}
            first={i === 0}
            index={i}
            cert={{ id: c.id, title: c.title, images: c.images, licenseNo: c.licenseNo, registrationDate: c.registrationDate, expiryDate: c.expiryDate, activities: c.activities, issuer: c.issuer }}
          />
        ))}
      </div>
    </section>
  );
}
