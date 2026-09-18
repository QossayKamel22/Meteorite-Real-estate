import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-brand-paper">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
