"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileText,
  PlayCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import type { PublicCategory } from "@/lib/types";
import type { SessionPayload } from "@/lib/auth/jwt";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", faculty: "Faculty", student: "Student" };
const DASHBOARD: Record<string, { href: string; label: string; icon: typeof LayoutDashboard }> = {
  admin: { href: "/admin", label: "Admin panel", icon: ShieldCheck },
  faculty: { href: "/faculty", label: "Faculty panel", icon: ShieldCheck },
  student: { href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
};

const LINKS = [
  { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { href: "/pyqs", label: "PYQ", hint: "Free papers", icon: FileText },
  { href: "/pyq-solutions", label: "PYQs with Solution", hint: "Video + PDF", icon: PlayCircle },
];

/** Phone/tablet navigation panel: expandable course categories, nav links and an account card. */
export function MobileMenu({
  categories,
  session,
  loading,
  pathname,
  onNavigate,
  onLogout,
}: {
  categories: PublicCategory[];
  session: SessionPayload | null;
  loading: boolean;
  pathname: string | null;
  onNavigate: () => void;
  onLogout: () => Promise<void>;
}) {
  const [coursesOpen, setCoursesOpen] = useState(pathname?.startsWith("/courses") ?? false);
  const [signingOut, setSigningOut] = useState(false);
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  const name = session?.name?.trim() || "My account";
  const dash = session ? (DASHBOARD[session.role] ?? DASHBOARD.student) : null;

  return (
    <div className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto py-4">
      {/* Account */}
      {!loading && session && dash ? (
        <div className="mb-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gradient text-base font-bold text-white">
              {(name[0] ?? "U").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-ink">{name}</p>
              {session.email && <p className="truncate text-xs text-ink-faint">{session.email}</p>}
            </div>
            <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
              {ROLE_LABEL[session.role] ?? session.role}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={dash.href}
              onClick={onNavigate}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand-gradient px-3 text-sm font-semibold text-white shadow-glass"
            >
              <dash.icon size={15} /> {dash.label}
            </Link>
            <button
              type="button"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  await onLogout();
                } finally {
                  setSigningOut(false);
                }
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 disabled:opacity-60"
            >
              <LogOut size={15} /> {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : !loading ? (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Link
            href="/login"
            onClick={onNavigate}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-glass"
          >
            <LogIn size={15} /> Log in
          </Link>
          <Link
            href="/register"
            onClick={onNavigate}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-surface-line bg-white text-sm font-semibold text-purple-700"
          >
            <UserPlus size={15} /> Register
          </Link>
        </div>
      ) : null}

      <nav className="flex flex-col gap-1">
        {/* Courses with expandable categories */}
        <button
          type="button"
          onClick={() => setCoursesOpen((v) => !v)}
          aria-expanded={coursesOpen}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold transition-colors",
            isActive("/courses") ? "bg-purple-50 text-purple-700" : "text-ink hover:bg-surface-tint"
          )}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-100 text-purple-700">
            <BookOpen size={17} />
          </span>
          <span className="flex-1">Courses</span>
          <ChevronDown size={18} className={cn("text-ink-faint transition-transform", coursesOpen && "rotate-180")} />
        </button>

        <AnimatePresence initial={false}>
          {coursesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="mb-1 ml-[1.15rem] space-y-0.5 border-l-2 border-purple-100 pl-4">
                <Link
                  href="/courses"
                  onClick={onNavigate}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50"
                >
                  All courses <ArrowRight size={14} />
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/courses?category=${c.slug}`}
                    onClick={onNavigate}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-surface-tint hover:text-ink"
                  >
                    <span className="flex-1 truncate font-medium">{c.name}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        c.courseCount > 0 ? "bg-purple-50 text-purple-700" : "bg-surface-tint text-ink-faint"
                      )}
                    >
                      {c.courseCount > 0 ? `${c.courseCount} course${c.courseCount === 1 ? "" : "s"}` : "Soon"}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold transition-colors",
              isActive(l.href) ? "bg-purple-50 text-purple-700" : "text-ink hover:bg-surface-tint"
            )}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-100 text-purple-700">
              <l.icon size={17} />
            </span>
            <span className="flex-1">{l.label}</span>
            {l.hint && <span className="text-xs font-medium text-ink-faint">{l.hint}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
