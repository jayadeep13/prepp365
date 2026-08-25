"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { logout } from "@/lib/auth/client-actions";
import { useSession } from "@/lib/auth/use-session";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { refresh } = useSession();

  // The login form isn't part of the admin tool itself — no sidebar, no session yet.
  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await logout();
    await refresh();
    router.push("/admin/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute -left-24 top-32 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 top-96 h-96 w-96 rounded-full bg-orange-500/[0.06] blur-[100px]" />

      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container-page grid grid-cols-3 items-center py-3.5">
          <Link href="/admin" className="justify-self-start transition-transform hover:scale-105">
            <Image src="/logo.png" alt="Prepp365 Admin" width={1821} height={864} className="h-9 w-auto" priority />
          </Link>

          <div className="justify-self-center flex items-center gap-2.5">
            <LayoutDashboard size={17} strokeWidth={2.25} className="text-purple-500" />
            <p className="font-display text-lg font-bold tracking-tight bg-brand-gradient bg-clip-text text-transparent">
              Admin Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="justify-self-end flex items-center gap-1.5 rounded-full border border-surface-line px-4 py-2 text-xs font-semibold text-ink-soft shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
        <div className="h-[3px] bg-brand-gradient" />
      </div>
      <div className="container-page relative py-10">
        <div className="grid lg:grid-cols-[220px_1fr] lg:divide-x lg:divide-white/10">
          <div className="lg:pr-6">
            <AdminSidebar />
          </div>
          <div className="min-w-0 lg:pl-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
