import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <AdminSidebar name={session.name} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
