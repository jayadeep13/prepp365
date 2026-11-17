"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, BookOpen, User, ShieldCheck } from "lucide-react";
import type { SessionPayload } from "@/lib/auth/jwt";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<SessionPayload["role"], string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};

/** Avatar + name button that opens a dropdown with dashboard links and Sign out. */
export function AccountMenu({ session, onLogout }: { session: SessionPayload; onLogout: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const name = session.name?.trim() || "My account";
  const initial = (name[0] ?? "U").toUpperCase();

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await onLogout();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  const links =
    session.role === "admin"
      ? [
          { href: "/admin", label: "Admin panel", icon: ShieldCheck },
          { href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
        ]
      : session.role === "faculty"
        ? [
            { href: "/faculty", label: "Faculty panel", icon: ShieldCheck },
            { href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
          ]
        : [
            { href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
            { href: "/dashboard/courses", label: "My courses", icon: BookOpen },
            { href: "/dashboard/profile", label: "Profile", icon: User },
          ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 transition-colors",
          open ? "border-purple-300 bg-surface-tint" : "border-surface-line hover:bg-surface-tint"
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
          {initial}
        </span>
        <span className="max-w-[140px] truncate text-sm font-semibold text-ink">{name}</span>
        <ChevronDown size={15} className={cn("text-ink-faint transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-surface-line bg-white shadow-glass-lg z-50"
          >
            <div className="flex items-center gap-3 border-b border-surface-line px-4 py-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{name}</p>
                {session.email && <p className="truncate text-xs text-ink-faint">{session.email}</p>}
                <span className="mt-1 inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                  {ROLE_LABEL[session.role] ?? session.role}
                </span>
              </div>
            </div>

            <div className="py-1.5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-tint hover:text-ink"
                >
                  <l.icon size={15} /> {l.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-surface-line py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <LogOut size={15} /> {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
