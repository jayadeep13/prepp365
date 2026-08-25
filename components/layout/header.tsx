"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCategory, PublicCourse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/use-session";
import { logout } from "@/lib/auth/client-actions";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Mock Tests", href: "/mock-tests" },
];

const roleDashboard: Record<string, string> = {
  admin: "/admin",
  faculty: "/faculty",
  student: "/dashboard",
};

export function Header({ categories }: { categories: PublicCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const minimal = pathname === "/login" || pathname === "/register";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { session, loading, refresh } = useSession();

  async function handleLogout() {
    await logout();
    await refresh();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      const results: PublicCourse[] = data.courses ?? [];
      const qLower = q.toLowerCase();
      const match = results.find(
        (c) =>
          c.title.toLowerCase().includes(qLower) ||
          c.examTag.toLowerCase().includes(qLower) ||
          c.category?.name?.toLowerCase().includes(qLower)
      );
      router.push(match ? `/courses/${match.slug}` : "/courses");
    } catch {
      router.push("/courses");
    } finally {
      setSearching(false);
      setQuery("");
    }
  }

  if (minimal) {
    return (
      <header className="sticky top-0 z-50 border-b border-surface-line bg-white/95">
        <div className="container-page flex h-16 items-center">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.png" alt="Prepp365" width={1821} height={864} priority className="h-12 w-auto" />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-glass" : "bg-white/95 border-b border-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Prepp365" width={1821} height={864} priority className="h-12 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => categories.length > 0 && setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            {categories.length > 0 ? (
              <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-tint">
                Courses <ChevronDown size={14} className={cn("transition-transform", megaOpen && "rotate-180")} />
              </button>
            ) : (
              <Link href="/courses" className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-tint">
                Courses
              </Link>
            )}
            <AnimatePresence>
              {megaOpen && categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3"
                >
                  <div className="rounded-card border border-surface-line bg-white p-5 shadow-glass-lg grid grid-cols-3 gap-1">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/courses?category=${c.slug}`}
                        className="rounded-xl px-3 py-2.5 hover:bg-surface-tint transition-colors"
                      >
                        <p className="text-sm font-semibold text-ink">{c.name}</p>
                        <p className="text-xs text-ink-faint">{c.courseCount} courses</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-tint"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-44 xl:w-56 rounded-full border border-surface-line bg-white py-2 pl-4 pr-10 text-sm text-ink outline-none focus-visible:outline-none placeholder:uppercase placeholder:text-xs placeholder:tracking-wide placeholder:text-ink-faint focus:border-purple-300"
            />
            <button
              type="submit"
              aria-label="Search courses"
              disabled={searching}
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-surface-tint disabled:opacity-50"
            >
              <Search size={16} />
            </button>
          </form>
          {!loading && session ? (
            <div className="flex items-center gap-2">
              <Link href={roleDashboard[session.role] ?? "/dashboard"}>
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <LayoutDashboard size={14} /> {session.name?.split(" ")[0] ?? "Dashboard"}
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-surface-tint"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Log in
              </Button>
            </Link>
          )}
        </div>

        <button
          className="lg:hidden grid h-10 w-10 place-items-center rounded-full text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-surface-line bg-white"
          >
            <div className="container-page py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-surface-tint"
                >
                  {link.label}
                </Link>
              ))}
              {!loading && session ? (
                <div className="flex gap-2 mt-2">
                  <Link href={roleDashboard[session.role] ?? "/dashboard"} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="primary" size="sm" className="flex-1" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              ) : (
                <Link href="/login" className="mt-2 block">
                  <Button variant="primary" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
