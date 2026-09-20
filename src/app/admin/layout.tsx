import { redirect } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import { getSessionUser } from "@/lib/session";

// Defense-in-depth: proxy.ts already blocks unauthenticated/non-admin
// requests to /admin/**, but this checks again at the server-component
// level so admin access never depends on the proxy alone.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!user.admin) redirect("/");

  return (
    <div className="flex min-h-full flex-col bg-brand-paper">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
