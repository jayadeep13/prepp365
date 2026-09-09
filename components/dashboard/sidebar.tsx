"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap as CoursesIcon, UserCircle, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: CoursesIcon },
  { href: "/dashboard/chat", label: "Chat", icon: MessagesSquare },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
              active ? "bg-brand-gradient text-white" : "text-ink-soft hover:bg-surface-tint"
            )}
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
