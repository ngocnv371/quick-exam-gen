import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getProfileRole } from "@/lib/admin";

async function AdminGuard({ children }: { children: React.ReactNode }) {
  const role = await getProfileRole();
  if (role === null) redirect("/auth/login");
  if (role !== "admin") redirect("/projects");
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-foreground/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <AdminGuard>{children}</AdminGuard>
    </Suspense>
  );
}
