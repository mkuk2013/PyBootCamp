import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
